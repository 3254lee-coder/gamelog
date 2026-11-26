export function authMessage(error: unknown, fallback: string) {
  const code = error && typeof error === "object" && "code" in error ? error.code : "";
  switch (code) {
    case "invalid_credentials": return "이메일 또는 비밀번호를 확인해 주세요.";
    case "email_not_confirmed": return "가입 확인 메일에서 이메일 인증을 완료해 주세요.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit": return "요청이 많습니다. 잠시 후 다시 시도해 주세요.";
    case "weak_password": return "더 안전한 비밀번호를 입력해 주세요.";
    case "validation_failed": return "이메일 형식과 입력 내용을 확인해 주세요.";
    default: return fallback;
  }
}
