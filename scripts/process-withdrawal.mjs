// Operator-only. Supply credentials in the process environment, never in the client.
import { processVerifiedWithdrawal } from "../lib/withdrawal-runner.mjs";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const [member, project, confirm, ...extra] = process.argv.slice(2);
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (
    !url ||
    !key ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(member ?? "") ||
    !project ||
    new URL(url).origin !== `https://${project}.supabase.co` ||
    confirm !== "--process-verified-request" ||
    extra.length
  ) {
    throw new Error(
      "회원 UUID, 프로젝트 ref, --process-verified-request 및 서버 환경변수를 확인하세요.",
    );
  }
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await processVerifiedWithdrawal(db, member);
  console.log("탈퇴 처리가 완료되었습니다.");
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
