
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

function getNickname(user: User) {
  return String(
    user.user_metadata?.nickname ||
      user.user_metadata?.display_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "내 계정"
  );
}

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const db = getSupabase();

    if (!db) {
      setReady(true);
      return;
    }

    db.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  async function signOut() {
    const db = getSupabase();
    if (!db || busy) return;

    setBusy(true);

    const { error } = await db.auth.signOut();

    if (error) {
      window.alert(
        "로그아웃에 실패했습니다: " + error.message
      );
      setBusy(false);
      return;
    }

    setUser(null);
    setOpen(false);
    setBusy(false);

    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return (
      <span className="text-xs text-[#829482]">
        확인 중...
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-[#dce7d8] bg-white px-4 py-2 text-xs font-bold text-[#668b6c] transition hover:bg-[#edf5e8]"
      >
        <UserRound size={16} />
        로그인 / 회원가입
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="내 계정 메뉴"
        className="flex items-center gap-2 rounded-full px-2 py-1.5 text-[#405a46] transition hover:bg-[#edf5e8]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f1e2] text-[#668b6c]">
          <UserRound size={20} />
        </span>

        <span className="max-w-28 truncate text-xs font-bold">
          {getNickname(user)}
        </span>

        <ChevronDown
          size={15}
          className={`text-[#668b6c] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[100] mt-3 w-56 overflow-hidden rounded-2xl border border-[#e3e9df] bg-white p-2 text-[#405a46] shadow-xl"
        >
          <div className="border-b border-[#edf0e9] px-3 py-3">
            <p className="text-[11px] font-bold tracking-wider text-[#829482]">
              LIKE TURTLE MEMBER
            </p>

            <p className="mt-1 truncate text-xs font-semibold">
              {user.email}
            </p>
          </div>

          <Link
            href="/my"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-[#edf5e8]"
          >
            <UserRound
              size={18}
              className="text-[#668b6c]"
            />
            마이페이지
          </Link>

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#b56b6b] transition hover:bg-[#fff1f1] disabled:opacity-50"
          >
            <LogOut size={18} />
            {busy
              ? "로그아웃 중..."
              : "로그아웃"}
          </button>
        </div>
      )}
    </div>
  );
}
