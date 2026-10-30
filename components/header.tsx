
import Link from "next/link";
import { Turtle } from "lucide-react";
import AuthStatus from "@/components/auth-status";

const nav = [
  { href: "/", label: "홈" },
  { href: "/guide", label: "사육 가이드" },
  { href: "/species", label: "거북이 도감" },
  { href: "/community", label: "커뮤니티" },
  { href: "/growth", label: "성장일기" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5ebdf] bg-[#fffefa]/95 backdrop-blur">
      <div className="container-site flex min-h-[68px] items-center justify-between gap-2 py-3 md:min-h-[76px] md:gap-4">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3"
          aria-label="거북이처럼 홈으로 이동"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4efdc] text-[#64866a] md:h-11 md:w-11">
            <Turtle size={27} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <div className="font-hand text-xl font-bold leading-tight text-[#405a46] sm:text-2xl">
              거북이처럼
            </div>
            <div className="text-[10px] text-[#8b9c87] sm:text-[11px]">
              조금 느리면 어때
            </div>
          </div>
        </Link>

        <div className="flex min-w-0 items-center gap-4 lg:gap-7">
          <nav
            aria-label="PC 주요 메뉴"
            className="hidden items-center gap-4 md:flex lg:gap-6"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm font-semibold text-[#607764] transition hover:text-[#3e6647]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="min-w-0 shrink-0">
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
