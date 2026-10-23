
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import AuthStatus from "./auth-status";

const nav = [
  { href: "/", label: "홈" },
  { href: "/games", label: "게임 탐색" },
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e6eb] bg-[#f8f6f1]/95 backdrop-blur-xl">
      <div className="container-site flex h-17 items-center justify-between gap-5">
        {/* GAMELOG 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#384b61]"
        >
          <span className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-xl bg-[#e8edf4] text-[#6686b5]">
            <Gamepad2 size={22} />
          </span>

          <span className="font-hand text-4xl leading-none tracking-[-0.06em]">
            GAMELOG
            <span className="text-[#6686b5]">.</span>
          </span>
        </Link>

        {/* PC 메뉴 */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-2 text-sm font-semibold transition ${
                path === item.href
                  ? "text-[#6686b5]"
                  : "text-[#66768b] hover:text-[#384b61]"
              }`}
            >
              {item.label}

              {path === item.href && (
                <span className="absolute bottom-0 left-0 h-[3px] w-full rotate-[-2deg] rounded-full bg-[#e7b94c]" />
              )}
            </Link>
          ))}
        </nav>

        {/* 검색 및 로그인 */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/games"
            className="text-[#6686b5] transition hover:text-[#384b61]"
            aria-label="게임 검색"
          >
            <Search size={20} />
          </Link>

          <div className="text-sm text-[#384b61]">
            <AuthStatus />
          </div>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className="text-[#384b61] md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <nav className="container-site flex flex-col gap-4 border-t border-[#e2e6eb] py-4 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-semibold ${
                path === item.href
                  ? "text-[#6686b5]"
                  : "text-[#384b61]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t border-[#e2e6eb] pt-4 text-sm text-[#384b61]">
            <AuthStatus />
          </div>
        </nav>
      )}
    </header>
  );
}
