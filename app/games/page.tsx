
import type { Metadata } from "next";
import GameBrowser from "@/components/game-browser";

export const metadata: Metadata = {
  title: "게임 탐색",
};

export default function GamesPage() {
  return (
    <main className="container-site min-h-[70vh] pt-12 pb-20 text-[#384b61]">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#6686b5]">
        EXPLORE GAMES
      </p>

      <h1 className="font-hand mt-3 text-5xl md:text-6xl">
        게임 탐색
        <span className="ml-2 inline-block rotate-[-12deg] text-[#e7b94c]">
          ✳
        </span>
      </h1>

      <div className="mt-2 h-1.5 w-28 rotate-[-2deg] rounded-full bg-[#f2c86b]" />

      <p className="mt-6 text-sm leading-7 text-[#66768b]">
        플랫폼과 장르를 선택해 취향에 맞는 게임을 찾아보세요.
      </p>

      <GameBrowser />
    </main>
  );
}
