
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Mail,
  LockKeyhole,
  Sparkles,
  Star,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();
  const isLogin = mode === "login";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const db = getSupabase();

    if (!db) {
      setMessage("Supabase 환경 변수가 설정되지 않았습니다.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { data, error } =
        mode === "signup"
          ? await db.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: window.location.origin + "/login",
              },
            })
          : await db.auth.signInWithPassword({
              email,
              password,
            });

      if (error) throw error;

      if (data.session) {
        router.push("/account");
        router.refresh();
      } else {
        setMessage("인증 메일을 확인한 후 로그인해 주세요.");
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "요청에 실패했습니다."
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
    <main className="container-site min-h-[75vh] pb-24 pt-14 text-[#384b61]">
      <div className="mx-auto max-w-md">
        <div className="relative mb-9 text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#e8edf4] text-[#6686b5]">
            <Gamepad2 size={42} strokeWidth={1.5} />

            <Sparkles
              size={22}
              className="absolute -right-5 -top-2 text-[#e7b94c]"
            />

            <Star
              size={20}
              className="absolute -bottom-2 -left-5 text-[#e7b94c]"
            />
          </div>

          <p className="mt-7 text-xs font-bold tracking-[.2em] text-[#6686b5]">
            {isLogin ? "WELCOME BACK" : "JOIN GAMELOG"}
          </p>

          <h1 className="font-hand mt-3 text-3xl md:text-4xl">
            {isLogin
              ? "다시 만나서 반가워요!"
              : "함께 게임을 기록해요!"}
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#8493a6]">
            {isLogin ? (
              <>
                당신의 게임 이야기를 이어가세요.
                <br />
                GAMELOG가 기다리고 있었어요.
              </>
            ) : (
              <>
                좋아하는 게임을 발견하고,
                <br />
                나만의 리뷰와 추억을 남겨보세요.
              </>
            )}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[28px] border border-[#e2e6eb] bg-white p-7 shadow-sm md:p-9"
        >
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Mail size={17} className="text-[#6686b5]" />
                이메일
              </span>

              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                className="w-full rounded-xl border border-[#e2e6eb] bg-[#f8fafc] px-4 py-3.5 text-sm text-[#384b61] outline-none transition placeholder:text-[#a1adbc] focus:border-[#6686b5] focus:ring-2 focus:ring-[#6686b5]/15"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                <LockKeyhole
                  size={17}
                  className="text-[#6686b5]"
                />
                비밀번호
              </span>

              <input
                required
                minLength={6}
                type="password"
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isLogin
                    ? "비밀번호를 입력하세요"
                    : "6자 이상 입력하세요"
                }
                className="w-full rounded-xl border border-[#e2e6eb] bg-[#f8fafc] px-4 py-3.5 text-sm text-[#384b61] outline-none transition placeholder:text-[#a1adbc] focus:border-[#6686b5] focus:ring-2 focus:ring-[#6686b5]/15"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6686b5] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#5576a5] disabled:cursor-not-allowed disabled:opacity-50"
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
              className="mt-5 rounded-xl bg-[#f3f6fa] p-4 text-sm leading-6 text-[#6686b5]"
            >
              {message}
            </p>
          )}

          <div className="mt-7 border-t border-[#edf0f3] pt-6 text-center">
            <p className="text-sm text-[#8493a6]">
              {isLogin
                ? "아직 GAMELOG 계정이 없나요?"
                : "이미 GAMELOG 계정이 있나요?"}
            </p>

            <button
              type="button"
              onClick={switchMode}
              className="mt-2 text-sm font-bold text-[#6686b5] transition hover:underline"
            >
              {isLogin ? "회원가입하기" : "로그인하기"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm text-[#8493a6] transition hover:text-[#6686b5]"
          >
            로그인 없이 게임 둘러보기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
