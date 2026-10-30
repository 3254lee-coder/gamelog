
import Link from "next/link";
import { Turtle } from "lucide-react";
import AuthStatus from "@/components/auth-status";

const nav = [
  { href: "/", label: "홈" },
  { href: "/guide", label: "사육 가이드" },
  { href: "/species", label: "거북이 도감" },
  { href: "/community", label: "커뮤니티" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5ebdf] bg-[#fffefa]/95 backdrop-blur">
      <div className="container-site flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e4efdc] text-[#64866a]">
            <Turtle size={28} strokeWidth={1.8} />
          </div>

          <div>
            <div className="font-hand text-2xl font-bold leading-tight text-[#405a46]">
              거북이처럼
            </div>
            <div className="text-[11px] text-[#8b9c87]">
              조금 느리면 어때
            </div>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-4 md:gap-7">
          <nav className="flex flex-wrap items-center gap-4 md:gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[#607764] transition hover:text-[#3e6647]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
