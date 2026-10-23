
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { games } from "@/lib/games";
import { getSupabase } from "@/lib/supabase";
import GameCard from "./game-card";

type ReviewRow = {
  game_id: string;
  score: number;
};

type GameStats = {
  rating: number;
  reviews: number;
};

const platforms = [
  "전체",
  "PC",
  "PlayStation",
  "Xbox",
  "Switch",
  "Mobile",
];

const genres = [
  "전체",
  ...Array.from(new Set(games.map((game) => game.genre))),
];

export default function GameBrowser() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("전체");
  const [genre, setGenre] = useState("전체");
  const [sort, setSort] = useState("rating");

  const [stats, setStats] = useState<Record<string, GameStats>>({});
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;
    const db = getSupabase();

    async function loadStats() {
      if (!db) {
        if (active) {
          setStatsError(true);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await db
        .from("reviews")
        .select("game_id,score");

      if (!active) return;

      if (error) {
        setStatsError(true);
        setLoading(false);
        return;
      }

      const totals: Record<
        string,
        { sum: number; count: number }
      > = {};

      for (const review of (data ?? []) as ReviewRow[]) {
        if (!totals[review.game_id]) {
          totals[review.game_id] = { sum: 0, count: 0 };
        }

        totals[review.game_id].sum += review.score;
        totals[review.game_id].count += 1;
      }

      const result: Record<string, GameStats> = {};

      for (const [gameId, total] of Object.entries(totals)) {
        result[gameId] = {
          rating: total.sum / total.count,
          reviews: total.count,
        };
      }

      setStats(result);
      setStatsError(false);
      setLoading(false);
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      games
        .filter(
          (game) =>
            (game.title + " " + game.englishTitle)
              .toLowerCase()
              .includes(q.toLowerCase()) &&
            (platform === "전체" ||
              game.platforms.includes(platform as never)) &&
            (genre === "전체" || game.genre === genre)
        )
        .sort((a, b) => {
          const aStats = stats[a.id] ?? { rating: 0, reviews: 0 };
          const bStats = stats[b.id] ?? { rating: 0, reviews: 0 };

          if (sort === "rating") {
            return bStats.rating - aStats.rating;
          }

          if (sort === "reviews") {
            return bStats.reviews - aStats.reviews;
          }

          return b.year - a.year;
        }),
    [q, platform, genre, sort, stats]
  );

  return (
    <>
      <div className="mt-9 rounded-[24px] border border-[#dfe5ed] bg-[#e8edf4] p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center gap-2 text-[#384b61]">
          <Sparkles size={19} className="text-[#d9a43d]" />
          <span className="font-hand text-2xl">
            취향에 맞는 게임 찾기
          </span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#dce3ec] bg-white px-4 transition focus-within:border-[#6686b5] focus-within:ring-2 focus-within:ring-[#6686b5]/20">
            <Search size={19} className="shrink-0 text-[#6686b5]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="어떤 게임을 찾고 있나요?"
              className="h-12 w-full min-w-0 bg-transparent text-sm text-[#384b61] outline-none placeholder:text-[#a1adbc]"
              aria-label="게임 검색"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="genre">
              장르
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#dce3ec] bg-white px-3 text-sm text-[#384b61] outline-none focus:border-[#6686b5] sm:min-w-36"
            >
              {genres.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="sort">
              정렬
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#dce3ec] bg-white px-3 text-sm text-[#384b61] outline-none focus:border-[#6686b5] sm:min-w-40"
            >
              <option value="rating">평점 높은순</option>
              <option value="reviews">리뷰 많은순</option>
              <option value="latest">출시연도 최신순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {platforms.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPlatform(item)}
            aria-pressed={platform === item}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              platform === item
                ? "border-[#6686b5] bg-[#6686b5] text-white shadow-sm"
                : "border-[#dfe5ed] bg-white text-[#66768b] hover:border-[#6686b5] hover:text-[#384b61]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-9 flex items-center justify-between">
        <p className="text-sm text-[#8995a5]" aria-live="polite">
          검색 결과{" "}
          <strong className="font-bold text-[#384b61]">
            {filtered.length}
          </strong>
          개
          {loading && " · 리뷰 통계 불러오는 중..."}
        </p>
        <SlidersHorizontal size={18} className="text-[#6686b5]" />
      </div>

      {statsError && (
        <p className="mt-4 rounded-xl bg-[#fff6e8] p-4 text-sm text-[#96712d]">
          리뷰 통계를 불러오지 못했습니다.
          잠시 후 페이지를 새로고침해 주세요.
        </p>
      )}

      {filtered.length ? (
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={{
                ...game,
                rating: stats[game.id]?.rating ?? 0,
                reviews: stats[game.id]?.reviews ?? 0,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-[#dfe5ed] bg-white py-20 text-center text-[#8995a5]">
          조건에 맞는 게임이 없습니다.
        </div>
      )}
    </>
  );
}
