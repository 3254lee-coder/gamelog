
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  House,
  LibraryBig,
  MessageCircle,
  NotebookPen,
} from "lucide-react";

const items = [
  {
    href: "/",
    label: "홈",
    icon: House,
  },
  {
    href: "/guide",
    label: "가이드",
    icon: BookOpen,
  },
  {
    href: "/species",
    label: "도감",
    icon: LibraryBig,
  },
  {
    href: "/community",
    label: "커뮤니티",
    icon: MessageCircle,
  },
  {
    href: "/growth",
    label: "성장일기",
    icon: NotebookPen,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="모바일 주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#e3eadf] bg-[#fffefa]/95 shadow-[0_-5px_25px_rgba(50,75,55,0.06)] backdrop-blur-xl md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pt-2 pb-2">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors"
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-[#e4efdc] text-[#4e7858]"
                    : "text-[#8b9c87]"
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.8}
                  aria-hidden="true"
                />
              </span>

              <span
                className={`whitespace-nowrap text-[10px] leading-tight ${
                  active
                    ? "font-bold text-[#405a46]"
                    : "font-medium text-[#829482]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
