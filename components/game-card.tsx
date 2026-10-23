
import Link from "next/link";
import { Star } from "lucide-react";
import type { Game } from "@/lib/games";

export default function GameCard({ game }: { game: Game }) {
  const hasRating = game.reviews > 0;

  return (
    <Link
      href={`/games/${game.id}`}
      className="group overflow-hidden rounded-2xl border border-[#e2e6eb] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#e8edf4]">
        {game.image ? (
          <img
            src={game.image}
            alt={`${game.title} 낙서 스타일 게임 커버`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-4"
            style={{ backgroundColor: `${game.accent}33` }}
          >
            <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
              {game.icon}
            </span>
            <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[#6686b5]">
              NEW GAME
            </span>
          </div>
        )}

        <span className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] truncate rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-wide text-[#384b61] shadow-sm">
          {game.englishTitle}
        </span>
      </div>

      <div className="p-4 text-[#384b61]">
        <h3 className="truncate text-sm font-bold md:text-base">
          {game.title}
        </h3>

        <p className="mt-1 text-xs text-[#8995a5]">
          {game.genre} · {game.year}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          {hasRating ? (
            <span className="flex items-center gap-1 text-sm font-bold text-[#d9a43d]">
              <Star size={15} fill="currentColor" />
              {game.rating.toFixed(1)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-[#6686b5]">
              <Star size={15} />
              평가 전
            </span>
          )}

          <span className="text-xs text-[#8995a5]">
            {hasRating
              ? `리뷰 ${game.reviews.toLocaleString()}개`
              : "첫 리뷰를 남겨주세요"}
          </span>
        </div>
      </div>
    </Link>
  );
}
