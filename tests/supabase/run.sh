#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
workdir="$(mktemp -d)"
cd "$workdir"
supabase init >/dev/null
web_pid=""
cleanup() {
  if [[ -n "$web_pid" ]]; then kill "$web_pid" 2>/dev/null || true; fi
  supabase stop --no-backup >/dev/null 2>&1 || true
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
node "$root/tests/supabase/live.mjs"
node "$root/tests/supabase/account-browser.mjs"
