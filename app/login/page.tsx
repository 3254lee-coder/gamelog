
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  LockKeyhole,
  Mail,
  Sparkles,
  Turtle,
  UserRound,
} from "lucide-react";
import {authMessage} from "@/lib/auth-message";
import { getSupabase } from "@/lib/supabase";

type Mode = "login" | "signup";

const POLICY_VERSION = "2026-11-25";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);

  const router = useRouter();
  const isLogin = mode === "login";
  const allAgreed = termsAgreed && privacyRead;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    const db = getSupabase();

    if (!db) {
      setMessage("Supabase 연결 설정을 확인해 주세요.");
      return;
    }

    const cleanEmail = email.trim();
    const cleanNickname = nickname.trim();

    if (
      !isLogin &&
      (cleanNickname.length < 2 || cleanNickname.length > 20)
    ) {
      setMessage("닉네임은 2~20자로 입력해 주세요.");
      return;
    }

    if (!isLogin && !allAgreed) {
      setMessage("이용약관에 동의하고 개인정보 처리 안내를 확인해 주세요.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await db.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo:
              window.location.origin + "/login",
            data: {
              nickname: cleanNickname,
              display_name: cleanNickname,
              terms_agreed: true,
              privacy_read: true,
              terms_version: POLICY_VERSION,
              privacy_version: POLICY_VERSION,
              policy_acknowledged_at: new Date().toISOString(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/my");
          router.refresh();
        } else {
          setMessage(
            "회원가입 요청이 완료되었습니다. 이메일 인증이 필요한 경우 받은 메일을 확인해 주세요."
          );
        }
      } else {
        const { data, error } =
          await db.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (error) throw error;

        if (data.session) {
          router.push("/my");
          router.refresh();
        }
      }
    } catch (error) {
      setMessage(
        authMessage(error, "요청을 처리하지 못했습니다.")
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (busy) return;

    const db = getSupabase();

    if (!db) {
      setMessage("Supabase 연결 설정을 확인해 주세요.");
      return;
    }

    if (!email.trim()) {
      setMessage(
        "비밀번호를 재설정할 이메일 주소를 먼저 입력해 주세요."
      );
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { error } = await db.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo:
            window.location.origin + "/reset-password",
        }
      );

      if (error) throw error;

      setMessage(
        "비밀번호 재설정 메일을 요청했습니다. 받은편지함을 확인해 주세요."
      );
    } catch (error) {
      setMessage(
        authMessage(error, "비밀번호 재설정 요청에 실패했습니다.")
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? "signup" : "login");
    setMessage("");
    setTermsAgreed(false);
    setPrivacyRead(false);
  }

  return (
    <main className="container-site min-h-[75vh] min-w-0 pb-28 pt-8 text-[#405a46] sm:pt-14 md:pb-24">
      <div className="mx-auto w-full max-w-md">
        <div className="relative mb-7 text-center sm:mb-9">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#e8f1e2] text-[#668b6c] sm:h-20 sm:w-20 sm:rounded-[26px]">
            <Turtle
              size={36}
              strokeWidth={1.5}
              className="sm:h-[45px] sm:w-[45px]"
            />

            <Sparkles
              size={19}
              className="absolute -right-4 -top-2 text-[#b7a16e] sm:-right-5 sm:h-[22px] sm:w-[22px]"
            />

            <Heart
              size={18}
              className="absolute -bottom-2 -left-4 text-[#d9a1a9] sm:-left-5 sm:h-5 sm:w-5"
            />
          </div>

          <p className="mt-6 break-words text-[10px] font-bold tracking-[0.12em] text-[#739578] sm:mt-7 sm:text-xs sm:tracking-[0.2em]">
            {isLogin
              ? "WELCOME BACK TO LIKE TURTLE"
              : "JOIN LIKE TURTLE"}
          </p>

          <h1 className="font-hand mt-3 break-keep text-[29px] leading-snug sm:text-3xl md:text-4xl">
            {isLogin
              ? "다시 만나서 반가워요!"
              : "거북이처럼, 함께해요!"}
          </h1>

          <p className="mt-3 break-keep text-[13px] leading-7 text-[#829482] sm:mt-4 sm:text-sm">
            {isLogin ? (
              <>
                우리 거북이의 소중한 이야기를
                <br />
                오늘도 함께 나눠보세요.
              </>
            ) : (
              <>
                조금 느리면 어때.
                <br />
                거북이와 함께하는 따뜻한 공간에 오신 걸 환영해요.
              </>
            )}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[22px] border border-[#e3e9df] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-7 md:p-9"
        >
          <div className="space-y-5">
            {!isLogin && (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <UserRound size={17} className="text-[#668b6c]" />
                  닉네임
                </span>

                <input
                  required
                  type="text"
                  minLength={2}
                  maxLength={20}
                  autoComplete="nickname"
                  value={nickname}
                  onChange={(event) =>
                    setNickname(event.target.value)
                  }
                  placeholder="2~20자 닉네임"
                  disabled={busy}
                  className="min-h-12 w-full min-w-0 rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-base outline-none focus:border-[#668b6c] disabled:opacity-60 sm:text-sm"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Mail size={17} className="text-[#668b6c]" />
                이메일
              </span>

              <input
                required
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="이메일 주소를 입력하세요"
                disabled={busy}
                className="min-h-12 w-full min-w-0 rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-base outline-none focus:border-[#668b6c] disabled:opacity-60 sm:text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <LockKeyhole size={17} className="text-[#668b6c]" />
                비밀번호
              </span>

              <input
                required
                minLength={6}
                type="password"
                autoComplete={
                  isLogin
                    ? "current-password"
                    : "new-password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder={
                  isLogin
                    ? "비밀번호를 입력하세요"
                    : "6자 이상 입력하세요"
                }
                disabled={busy}
                className="min-h-12 w-full min-w-0 rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-base outline-none focus:border-[#668b6c] disabled:opacity-60 sm:text-sm"
              />
            </label>
          </div>

          {isLogin && (
            <div className="mt-3 text-right">
              <button
                type="button"
                disabled={busy}
                onClick={resetPassword}
                className="inline-flex min-h-10 items-center text-xs font-semibold text-[#739578] hover:underline disabled:opacity-50"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          {!isLogin && (
            <fieldset
              disabled={busy}
              className="mt-6 rounded-2xl border border-[#e3e9df] bg-[#f5f9f2] p-4"
            >
              <legend className="sr-only">
                서비스 이용 안내
              </legend>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={(event) => {
                    setTermsAgreed(event.target.checked);
                    setPrivacyRead(event.target.checked);
                  }}
                  className="h-5 w-5 shrink-0 accent-[#668b6c]"
                />
                전체 확인 및 동의
              </label>

              <div className="my-2 border-t border-[#dce7d8]" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-xs font-semibold">
                  <input
                    required
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(event) =>
                      setTermsAgreed(event.target.checked)
                    }
                    className="h-[18px] w-[18px] shrink-0 accent-[#668b6c]"
                  />
                  이용약관 동의 (필수)
                </label>

                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#668b6c] underline"
                >
                  보기
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-xs font-semibold">
                  <input
                    required
                    type="checkbox"
                    checked={privacyRead}
                    onChange={(event) =>
                      setPrivacyRead(event.target.checked)
                    }
                    className="h-[18px] w-[18px] shrink-0 accent-[#668b6c]"
                  />
                  개인정보 처리 안내 확인 (필수)
                </label>

                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#668b6c] underline"
                >
                  보기
                </Link>
              </div>

              <p className="mt-3 break-keep text-[11px] leading-5 text-[#718573]">
                회원 인증과 서비스 제공에 필요한 이메일,
                닉네임 및 인증정보를 처리합니다.
                이용약관과 개인정보처리방침을 확인해 주세요.
              </p>
            </fieldset>
          )}

          <button
            type="submit"
            disabled={busy || (!isLogin && !allAgreed)}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#668b6c] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#527558] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7"
          >
            {busy
              ? "처리 중..."
              : isLogin
                ? "로그인"
                : "가입하기"}

            {!busy && <ArrowRight size={18} />}
          </button>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className="mt-5 break-words rounded-xl bg-[#edf5e8] p-4 text-sm leading-6 text-[#608566]"
            >
              {message}
            </p>
          )}

          <div className="mt-6 border-t border-[#edf0e9] pt-5 text-center sm:mt-7 sm:pt-6">
            <p className="break-keep text-[13px] text-[#829482] sm:text-sm">
              {isLogin
                ? "아직 거북이처럼 계정이 없나요?"
                : "이미 거북이처럼 계정이 있나요?"}
            </p>

            <button
              type="button"
              disabled={busy}
              onClick={switchMode}
              className="mt-1 inline-flex min-h-11 items-center justify-center px-3 text-sm font-bold text-[#668b6c] hover:underline disabled:opacity-50"
            >
              {isLogin
                ? "회원가입하기"
                : "로그인하기"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center sm:mt-8">
          <Link
            href="/community"
            className="inline-flex min-h-11 items-center justify-center gap-2 px-2 text-[13px] text-[#829482] hover:text-[#668b6c] sm:text-sm"
          >
            로그인 없이 커뮤니티 둘러보기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
