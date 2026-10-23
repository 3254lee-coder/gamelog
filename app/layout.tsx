
import type { Metadata } from "next";
import Header from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gamelog-tau.vercel.app"),

  title: {
    default: "GAMELOG | 게임을 기록하는 공간",
    template: "%s | GAMELOG",
  },

  description:
    "좋은 게임은 기억을 남긴다. 나만의 게임 경험을 기록하고 다른 플레이어와 공유하세요.",

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://gamelog-tau.vercel.app",
    siteName: "GAMELOG",
    title: "GAMELOG | 게임을 기록하는 공간",
    description:
      "좋은 게임은 기억을 남긴다. 나만의 게임 경험을 기록하고 다른 플레이어와 공유하세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GAMELOG - 좋은 게임은 기억을 남긴다.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "GAMELOG | 게임을 기록하는 공간",
    description:
      "좋은 게임은 기억을 남긴다. 나만의 게임 경험을 기록하고 다른 플레이어와 공유하세요.",
    images: ["/og-image.png"],
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

        <footer className="mt-24 border-t border-white/10 py-9">
          <div className="container-site flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row">
            <span>© 2026 GAMELOG</span>
            <span>좋은 게임은 기억을 남긴다.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
