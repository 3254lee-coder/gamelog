
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Turtle,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const db = getSupabase();

    if (!db) {
      setMessage("Supabase 연결 설정을 확인해 주세요.");
      setReady(true);
      return;
    }

    let active = true;

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((event) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        setAllowed(true);
        setReady(true);
      }
    });

    async function verifyRecovery() {
      const params = new URLSearchParams(
        window.location.search
      );

      const hash = new URLSearchParams(
        window.location.hash.slice(1)
      );

      if (params.get("error") || hash.get("error")) {
        if (active) {
          setMessage(
            "인증 링크가 만료되었거나 유효하지 않습니다."
          );
          setReady(true);
        }
        return;
      }

      const code = params.get("code");
      const tokenHash = params.get("token_hash");

      if (code) {
        const { error } =
          await db!.auth.exchangeCodeForSession(code);

        if (!active) return;

        if (error) {
          setMessage("인증 링크를 확인하지 못했습니다.");
        } else {
          setAllowed(true);
        }

        setReady(true);
        return;
      }

      if (
        tokenHash &&
        params.get("type") === "recovery"
      ) {
        const { error } = await db!.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (!active) return;

        if (error) {
          setMessage("인증 링크를 확인하지 못했습니다.");
        } else {
          setAllowed(true);
        }

        setReady(true);
        return;
      }

      if (
        hash.get("type") === "recovery" &&
        hash.get("access_token") &&
        hash.get("refresh_token")
      ) {
        const { error } = await db!.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });

        if (!active) return;

        if (error) {
          setMessage("인증 세션을 만들지 못했습니다.");
        } else {
          setAllowed(true);
        }

        setReady(true);
        return;
      }

      if (hash.get("type") === "recovery") {
        const { data } = await db!.auth.getSession();

        if (!active) return;

        setAllowed(Boolean(data.session));
        setReady(true);
        return;
      }

      if (active) {
        setMessage(
          "비밀번호 재설정 이메일의 링크로 접속해 주세요."
        );
        setReady(true);
      }
    }

    void verifyRecovery();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!allowed) return;

    if (password.length < 6) {
      setMessage("비밀번호는 6자 이상 입력해 주세요.");
      return;
    }

    if (password !== confirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const db = getSupabase();

    if (!db) {
      setMessage("Supabase 연결 설정을 확인해 주세요.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { error } = await db.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccess(true);
      setPassword("");
      setConfirm("");
      setMessage("비밀번호가 변경되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setBusy(false);
    }
  }

  async function goToLogin() {
    const db = getSupabase();
    await db?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="container-site min-h-[75vh] pb-24 pt-16 text-[#405a46]">
      <div className="mx-auto max-w-md">
        <div className="mb-9 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#e8f1e2] text-[#668b6c]">
            <Turtle size={44} strokeWidth={1.5} />
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#739578]">
            LIKE TURTLE
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            비밀번호 재설정
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#829482]">
            새로운 비밀번호를 설정해 주세요.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#e3e9df] bg-white p-7 shadow-sm md:p-9">
          {!ready ? (
            <p className="text-center text-sm text-[#829482]">
              인증 링크 확인 중...
            </p>
          ) : success ? (
            <div className="text-center">
              <p className="text-sm text-[#608566]">
                비밀번호 변경이 완료되었습니다.
              </p>

              <button
                type="button"
                onClick={goToLogin}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#668b6c] px-6 py-3 text-sm font-bold text-white"
              >
                로그인 화면으로
                <ArrowRight size={17} />
              </button>
            </div>
          ) : allowed ? (
            <form onSubmit={submit} className="space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <LockKeyhole size={17} />
                  새 비밀번호
                </span>

                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="6자 이상 입력"
                  className="w-full rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-sm outline-none focus:border-[#668b6c]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  새 비밀번호 확인
                </span>

                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) =>
                    setConfirm(event.target.value)
                  }
                  placeholder="비밀번호 다시 입력"
                  className="w-full rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3.5 text-sm outline-none focus:border-[#668b6c]"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#668b6c] px-5 py-4 text-sm font-bold text-white hover:bg-[#527558] disabled:opacity-50"
              >
                {busy
                  ? "변경 중..."
                  : "새 비밀번호 저장"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-[#829482]">
                로그인 화면에서 재설정 메일을 다시 요청해 주세요.
              </p>

              <Link
                href="/login"
                className="mt-5 inline-block text-sm font-bold text-[#668b6c] underline"
              >
                로그인 화면으로
              </Link>
            </div>
          )}

          {message && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-[#edf5e8] p-4 text-sm leading-6 text-[#608566]"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
