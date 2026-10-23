
"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { games } from "@/lib/games";
import GameCard from "./game-card";

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
        .sort((a, b) =>
          sort === "rating"
            ? b.rating - a.rating
            : sort === "reviews"
              ? b.reviews - a.reviews
              : b.year - a.year
        ),
    [q, platform, genre, sort]
  );

  return (
    <>
      {/* 검색 및 정렬 영역 */}
      <div className="mt-9 rounded-[24px] border border-[#dfe5ed] bg-[#e8edf4] p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center gap-2 text-[#384b61]">
          <Sparkles size={19} className="text-[#d9a43d]" />
          <span className="font-hand text-2xl">
            취향에 맞는 게임 찾기
          </span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          {/* 게임 검색 */}
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

          {/* 장르 및 정렬 */}
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

      {/* 플랫폼 필터 */}
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

      {/* 검색 결과 */}
      <div className="mt-9 flex items-center justify-between">
        <p className="text-sm text-[#8995a5]" aria-live="polite">
          검색 결과{" "}
          <strong className="font-bold text-[#384b61]">
            {filtered.length}
          </strong>
          개
        </p>

        <SlidersHorizontal size={18} className="text-[#6686b5]" />
      </div>

      {/* 게임 카드 */}
      {filtered.length ? (
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
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
