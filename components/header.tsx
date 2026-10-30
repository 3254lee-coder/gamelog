
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Turtle, Menu, X } from "lucide-react";
import { useState } from "react";
import AuthStatus from "./auth-status";

const nav = [
  { href: "/", label: "홈" },
  { href: "/guide", label: "사육 가이드" },
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe7dc] bg-[#f8f6f1]/95 backdrop-blur-xl">
      <div className="container-site flex min-h-[76px] items-center justify-between gap-4 py-2">
        {/* 거북이처럼 로고 */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 text-[#405a46]"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-11 w-11 shrink-0 rotate-[-8deg] items-center justify-center rounded-xl bg-[#e0ead8] text-[#62866a]">
            <Turtle size={27} strokeWidth={1.8} />
          </span>

          <span className="flex flex-col">
            <span className="font-hand text-3xl leading-none tracking-[-0.04em] sm:text-4xl">
              거북이처럼
              <span className="text-[#87a88b]">.</span>
            </span>

            <span className="mt-1 text-[11px] font-medium tracking-[0.08em] text-[#819784]">
              조금 느리면 어때
            </span>
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
                  ? "text-[#62866a]"
                  : "text-[#66768b] hover:text-[#405a46]"
              }`}
            >
              {item.label}

              {path === item.href && (
                <span className="absolute bottom-0 left-0 h-[3px] w-full rotate-[-2deg] rounded-full bg-[#e7b94c]" />
              )}
            </Link>
          ))}
        </nav>

        {/* PC 로그인 및 마이페이지 */}
        <div className="hidden items-center text-sm text-[#405a46] md:flex">
          <AuthStatus />
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className="text-[#405a46] md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <nav className="container-site flex flex-col gap-4 border-t border-[#dfe7dc] py-4 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-semibold ${
                path === item.href
                  ? "text-[#62866a]"
                  : "text-[#405a46]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t border-[#dfe7dc] pt-4 text-sm text-[#405a46]">
            <AuthStatus />
          </div>
        </nav>
      )}
    </header>
  );
}
