
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
import { getSupabase } from "@/lib/supabase";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();
  const isLogin = mode === "login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        error instanceof Error
          ? error.message
          : "요청을 처리하지 못했습니다."
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
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
        error instanceof Error
          ? error.message
          : "비밀번호 재설정 요청에 실패했습니다."
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? "signup" : "login");
    setMessage("");
  }

  return (
    <main className="container-site min-h-[75vh] pb-24 pt-14 text-[#405a46]">
      <div className="mx-auto max-w-md">
        <div className="relative mb-9 text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#e8f1e2] text-[#668b6c]">
            <Turtle size={45} strokeWidth={1.5} />

            <Sparkles
              size={22}
              className="absolute -right-5 -top-2 text-[#b7a16e]"
            />

            <Heart
              size={20}
              className="absolute -bottom-2 -left-5 text-[#d9a1a9]"
            />
          </div>

          <p className="mt-7 text-xs font-bold tracking-[0.2em] text-[#739578]">
            {isLogin
              ? "WELCOME BACK TO LIKE TURTLE"
              : "JOIN LIKE TURTLE"}
          </p>

          <h1 className="font-hand mt-3 text-3xl md:text-4xl">
            {isLogin
              ? "다시 만나서 반가워요!"
              : "거북이처럼, 함께해요!"}
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#829482]">
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
          className="rounded-[28px] border border-[#e3e9df] bg-white p-7 shadow-sm md:p-9"
        >
          <div className="space-y-5">
            {!isLogin && (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <UserRound
                    size={17}
                    className="text-[#668b6c]"
                  />
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
                  className="w-full rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-sm outline-none focus:border-[#668b6c]"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Mail
                  size={17}
                  className="text-[#668b6c]"
                />
                이메일
              </span>

              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="이메일 주소를 입력하세요"
                className="w-full rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-sm outline-none focus:border-[#668b6c]"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <LockKeyhole
                  size={17}
                  className="text-[#668b6c]"
                />
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
                className="w-full rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-sm outline-none focus:border-[#668b6c]"
              />
            </label>
          </div>

          {isLogin && (
            <div className="mt-3 text-right">
              <button
                type="button"
                disabled={busy}
                onClick={resetPassword}
                className="text-xs font-semibold text-[#739578] hover:underline disabled:opacity-50"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#668b6c] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#527558] disabled:opacity-50"
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
              className="mt-5 rounded-xl bg-[#edf5e8] p-4 text-sm leading-6 text-[#608566]"
            >
              {message}
            </p>
          )}

          <div className="mt-7 border-t border-[#edf0e9] pt-6 text-center">
            <p className="text-sm text-[#829482]">
              {isLogin
                ? "아직 거북이처럼 계정이 없나요?"
                : "이미 거북이처럼 계정이 있나요?"}
            </p>

            <button
              type="button"
              onClick={switchMode}
              className="mt-2 text-sm font-bold text-[#668b6c] hover:underline"
            >
              {isLogin
                ? "회원가입하기"
                : "로그인하기"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm text-[#829482] hover:text-[#668b6c]"
          >
            로그인 없이 커뮤니티 둘러보기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
