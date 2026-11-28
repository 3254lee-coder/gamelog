#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
workdir="$(mktemp -d)"
cd "$workdir"
supabase init >/dev/null
web_pid=""
restore_workdir=""
cleanup() {
  if [[ -n "$web_pid" ]]; then kill "$web_pid" 2>/dev/null || true; fi
  (cd "$workdir" && supabase stop --no-backup >/dev/null 2>&1) || true
  if [[ -n "$restore_workdir" ]]; then
    (cd "$restore_workdir" && supabase stop --no-backup >/dev/null 2>&1) || true
  fi
}
trap cleanup EXIT
docker network create -o com.docker.network.bridge.host_binding_ipv4=127.0.0.1 withdrawal-local >/dev/null
supabase start --network-id withdrawal-local -x studio,imgproxy,logflare,vector,edge-runtime,realtime,mailpit >/dev/null
# Use only the loopback stack created here. Never read a linked project's credentials.
supabase status -o env > "$workdir/local.env"
set -a
source "$workdir/local.env"
set +a
[[ "$API_URL" == http://127.0.0.1:54321 || "$API_URL" == http://localhost:54321 ]]
[[ "$DB_URL" == *@127.0.0.1:54322/postgres || "$DB_URL" == *@localhost:54322/postgres ]]

psql --dbname="$DB_URL" -X -v ON_ERROR_STOP=1 -f "$root/tests/supabase/fixture.sql"
for file in "$root"/supabase/migrations/*.sql; do psql --dbname="$DB_URL" -X -v ON_ERROR_STOP=1 -f "$file"; done
psql --dbname="$DB_URL" -X -c "notify pgrst, 'reload schema'"
sleep 2
# Compile the same browser configuration used by the application, with this stack's public key.
(cd "$root" && NEXT_PUBLIC_SUPABASE_URL="$API_URL" NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" NEXT_PUBLIC_MEMBER_SAFETY=true pnpm build && pnpm exec tsc --noEmit)
(cd "$root" && export NEXT_PUBLIC_SUPABASE_URL="$API_URL" SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" WITHDRAWAL_PROCESSING_ENABLED=true && exec node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3218) >"$workdir/web.log" 2>&1 &
web_pid=$!
for attempt in {1..40}; do
  if curl -fsS http://127.0.0.1:3218/login -o /dev/null; then break; fi
  sleep 1
done
if ! node "$root/tests/supabase/live.mjs"; then
  cat "$workdir/web.log"
  exit 1
fi
node "$root/tests/supabase/account-browser.mjs"
node --test "$root/tests/withdrawal-runner.test.mjs"

# Free-tier recovery rehearsal: only synthetic data in ephemeral local projects.
mkdir -p "$workdir/recovery-backup"
psql --dbname="$DB_URL" -X -v ON_ERROR_STOP=1 -c \
  "insert into recovery_probe.synthetic_records values ('11111111-1111-4111-8111-111111111111','{\"label\":\"synthetic restore rehearsal\"}'::jsonb)"
supabase db dump --schema recovery_probe --file "$workdir/recovery-backup/schema.sql"
supabase db dump --data-only --schema recovery_probe --file "$workdir/recovery-backup/data.sql"
API_URL="$API_URL" ANON_KEY="$ANON_KEY" SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
  BACKUP_DIR="$workdir/recovery-backup" node "$root/tests/supabase/backup-restore.mjs" export

if [[ -n "$web_pid" ]]; then kill "$web_pid" 2>/dev/null || true; web_pid=""; fi
(cd "$workdir" && supabase stop --no-backup >/dev/null)
restore_workdir="$(mktemp -d)"
(
  cd "$restore_workdir"
  supabase init >/dev/null
  supabase start -x studio,imgproxy,logflare,vector,edge-runtime,realtime,mailpit >/dev/null
  set -a
  source <(supabase status -o env)
  set +a
  psql --dbname="$DB_URL" -X -v ON_ERROR_STOP=1 -f "$workdir/recovery-backup/schema.sql"
  psql --dbname="$DB_URL" -X -v ON_ERROR_STOP=1 -f "$workdir/recovery-backup/data.sql"
  API_URL="$API_URL" ANON_KEY="$ANON_KEY" SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
    BACKUP_DIR="$workdir/recovery-backup" node "$root/tests/supabase/backup-restore.mjs" restore
  restored_label="$(psql --dbname="$DB_URL" -XAt -v ON_ERROR_STOP=1 -c \
    "select payload->>'label' from recovery_probe.synthetic_records where id='11111111-1111-4111-8111-111111111111'")"
  [[ "$restored_label" == "synthetic restore rehearsal" ]]
  echo "PASS: isolated CLI schema/data backup restored into a fresh local Supabase project"
  supabase stop --no-backup >/dev/null
)
