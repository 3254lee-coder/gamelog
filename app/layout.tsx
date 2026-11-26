import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/header";
import MobileNav from "@/components/mobile-nav";
import SiteAnalytics from "@/components/site-analytics";
import "./globals.css";

const siteUrl = "https://like-turtle.vercel.app";

const siteName = "거북이처럼 | LIKE TURTLE";

const siteDescription =
  "조금 느리면 어때. 육지거북과 수생거북 사육 가이드, 커뮤니티, 성장일기를 함께하는 따뜻한 반려 거북이 공간.";

const withdrawalEmail =
  "mailto:3254lee@naver.com?subject=" +
  encodeURIComponent("LIKE TURTLE 회원 탈퇴 문의") +
  "&body=" +
  encodeURIComponent(
    "안녕하세요.\nLIKE TURTLE 회원 탈퇴를 문의합니다.\n\n가입 이메일: \n문의 내용: \n\n※ 비밀번호는 입력하지 마세요."
  );

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: "LIKE TURTLE",

  title: {
    default: siteName,
    template: "%s | 거북이처럼",
  },

  description: siteDescription,

  keywords: [
    "거북이처럼",
    "LIKE TURTLE",
    "반려 거북이",
    "육지거북",
    "수생거북",
    "육지거북 사육",
    "수생거북 사육",
    "거북이 사육 가이드",
    "거북이 커뮤니티",
    "거북이 성장일기",
    "거북이 키우기",
    "거북이 사육방법",
    "거북이 정보",
    "호스필드 육지거북",
    "헤르만 육지거북",
    "설카타 육지거북",
  ],

  verification: {
    google: "obvuDWQvvT_CjtlPoauYG-3e0I1M1x0InlZv6BB3azg",
    other: {
      "naver-site-verification":
        "bc822860d02c2737861ce058b46c8f86577ef5f3",
    },
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "LIKE TURTLE",
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/tortoise-hero.png",
        width: 1645,
        height: 386,
        alt: "거북이처럼 - 조금 느리면 어때",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/tortoise-hero.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-w-0 overflow-x-hidden">
        <Header />

        {children}

        <footer className="mt-24 border-t border-[#e5ebdf] bg-[#fffefa] py-9 max-md:mb-20">
          <div className="container-site flex flex-col items-center justify-between gap-4 text-center text-xs text-[#829482] sm:flex-row sm:text-left">
            <div className="flex flex-col gap-1">
              <span>
                © 2026 LIKE TURTLE · 거북이처럼
              </span>

              <span>조금 느리면 어때</span>
            </div>

            <nav
              aria-label="사이트 운영 정보"
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end"
            >
              <Link
                href="/privacy"
                className="inline-flex min-h-10 items-center font-bold text-[#668b6c] transition hover:text-[#405a46] hover:underline"
              >
                개인정보처리방침
              </Link>

              <span
                aria-hidden="true"
                className="text-[#cbd8c7]"
              >
                |
              </span>

              <Link
                href="/terms"
                className="inline-flex min-h-10 items-center transition hover:text-[#405a46] hover:underline"
              >
                이용약관
              </Link>

              <span
                aria-hidden="true"
                className="text-[#cbd8c7]"
              >
                |
              </span>

              <a
                href={withdrawalEmail}
                className="inline-flex min-h-10 items-center font-semibold text-[#668b6c] transition hover:text-[#405a46] hover:underline"
              >
                회원 탈퇴 문의
              </a>
            </nav>
          </div>
        </footer>

        <MobileNav />

        <SiteAnalytics />
      </body>
    </html>
  );
}
