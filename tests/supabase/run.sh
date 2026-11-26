#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
workdir="$(mktemp -d)"
cd "$workdir"
supabase init >/dev/null
trap 'supabase stop --no-backup >/dev/null 2>&1 || true' EXIT
supabase start -x studio,imgproxy,logflare,vector,edge-runtime,realtime,mailpit
# Use only the loopback stack created here. Never read a linked project's credentials.
supabase status -o env > "$workdir/local.env"
set -a
source "$workdir/local.env"
set +a
[[ "$API_URL" == http://127.0.0.1:54321 || "$API_URL" == http://localhost:54321 ]]
[[ "$DB_URL" == *@127.0.0.1:54322/postgres || "$DB_URL" == *@localhost:54322/postgres ]]
export PGDATABASE="$DB_URL"
psql -X -v ON_ERROR_STOP=1 -f "$root/tests/supabase/fixture.sql"
for file in "$root"/supabase/migrations/*.sql; do psql -X -v ON_ERROR_STOP=1 -f "$file"; done
psql -X -c "notify pgrst, 'reload schema'"
sleep 2
node "$root/tests/supabase/live.mjs"
