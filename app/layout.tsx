
import type { Metadata } from "next";
import Header from "@/components/header";
import "./globals.css";

const siteUrl = "https://like-turtle.vercel.app";
const siteName = "거북이처럼 | LIKE TURTLE";
const siteDescription =
  "조금 느리면 어때. 육지거북 사육 가이드, 거북이 도감, 커뮤니티, 성장일기를 함께하는 따뜻한 공간.";

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
    "육지거북",
    "육지거북 사육",
    "거북이 사육 가이드",
    "거북이 도감",
    "거북이 커뮤니티",
    "거북이 성장일기",
    "호스필드 육지거북",
    "헤르만 육지거북",
    "설카타 육지거북",
  ],

  alternates: {
    canonical: siteUrl,
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Header />

        {children}

        <footer className="mt-24 border-t border-[#e5ebdf] py-9">
          <div className="container-site flex flex-col justify-between gap-2 text-xs text-[#829482] sm:flex-row">
            <span>© 2026 LIKE TURTLE · 거북이처럼</span>
            <span>조금 느리면 어때</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
