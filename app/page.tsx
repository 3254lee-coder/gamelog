
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Star,
  Sparkles,
  Crown,
  MessageCircle,
  PenLine,
} from "lucide-react";
import { games } from "@/lib/games";
import { getSupabase } from "@/lib/supabase";
import GameCard from "@/components/game-card";

type ReviewRow = {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  title: string;
  body: string;
  created_at: string;
};

type GameStats = {
  rating: number;
  reviews: number;
};

export default function Home() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const db = getSupabase();

    async function loadReviews() {
      if (!db) {
        if (active) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await db
        .from("reviews")
        .select("id,game_id,user_id,score,title,body,created_at")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(true);
      } else {
        setReviews((data ?? []) as ReviewRow[]);
        setError(false);
      }

      setLoading(false);
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totals: Record<
      string,
      { sum: number; count: number }
    > = {};

    for (const review of reviews) {
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

    return result;
  }, [reviews]);

  const featured = games.slice(0, 4).map((game) => ({
    ...game,
    rating: stats[game.id]?.rating ?? 0,
    reviews: stats[game.id]?.reviews ?? 0,
  }));

  const top = useMemo(
    () =>
      games
        .filter((game) => (stats[game.id]?.reviews ?? 0) > 0)
        .sort((a, b) => {
          const ratingDiff =
            stats[b.id].rating - stats[a.id].rating;

          if (ratingDiff !== 0) return ratingDiff;

          return stats[b.id].reviews - stats[a.id].reviews;
        })
        .slice(0, 5),
    [stats]
  );

  const latestReviews = reviews
    .filter((review) =>
      games.some((game) => game.id === review.game_id)
    )
    .slice(0, 3);

  return (
    <main className="container-site pb-24 text-[#384b61]">
      {/* 메인 배너 */}
      <section className="relative mt-8 overflow-hidden rounded-[32px] bg-[#e8edf4] px-7 py-14 md:px-14 md:py-20">
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[#6686b5]">
              <Crown size={27} strokeWidth={1.8} />
              <span className="text-xs font-bold tracking-[.2em]">
                GOOD GAMES, GOOD MEMORIES
              </span>
            </div>

            <h1 className="font-hand text-5xl leading-[1.05] text-[#384b61] md:text-7xl">
              좋은 게임은
              <br />
              기억을 남긴다.
            </h1>

            <div className="mt-3 h-2 w-48 rotate-[-2deg] rounded-full bg-[#f2c86b]" />

            <p className="mt-8 max-w-md text-sm leading-8 text-[#66768b] md:text-base">
              당신의 게임 경험을 기록하고,
              <br />
              다른 플레이어와 함께 공유하는 공간.
              <br />
              여기는 GAMELOG입니다.
            </p>

            <Link href="/games" className="gamelog-button mt-8">
              게임 둘러보기
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* 손그림 스타일 게임 아트 영역 */}
          <div className="relative flex min-h-[300px] items-center justify-center md:min-h-[390px]">
            <div className="absolute left-[12%] top-[5%] h-48 w-36 -rotate-12 rounded-2xl bg-[#d5dfea] shadow-xl md:h-60 md:w-44" />
            <div className="absolute right-[12%] top-[12%] h-48 w-36 rotate-12 rounded-2xl bg-[#b7cbe2] shadow-xl md:h-60 md:w-44" />

            <div className="relative z-10 flex h-56 w-48 rotate-[-4deg] flex-col items-center justify-center rounded-3xl border-4 border-white bg-[#6686b5] text-white shadow-2xl md:h-72 md:w-60">
              <Gamepad2 size={85} strokeWidth={1.2} />
              <span className="font-hand mt-5 text-4xl">
                GAMELOG!
              </span>
              <span className="mt-2 text-xs tracking-[.2em]">
                PLAY YOUR STORY
              </span>
            </div>

            <Sparkles
              className="absolute right-4 top-3 text-[#e7b94c]"
              size={40}
            />
            <Star
              className="absolute bottom-5 left-6 rotate-[-15deg] text-[#e7b94c]"
              size={43}
            />
            <PenLine
              className="absolute bottom-6 right-6 rotate-12 text-[#6686b5]"
              size={35}
            />
          </div>
        </div>
      </section>

      {/* 게임 둘러보기 */}
      <section className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.2em] text-[#6686b5]">
              DISCOVER GAMES
            </p>
            <h2 className="font-hand mt-2 text-4xl md:text-5xl">
              <Star className="mr-2 inline text-[#e7b94c]" size={30} />
              지금 주목받는 게임
            </h2>
          </div>

          <Link
            href="/games"
            className="flex items-center gap-1 text-sm font-semibold text-[#6686b5]"
          >
            전체 보기 <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* 평점과 실제 회원 리뷰 */}
      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-hand mb-6 text-4xl">
            <Crown className="mr-2 inline text-[#e7b94c]" />
            높은 평점의 게임
          </h2>

          <div className="overflow-hidden rounded-2xl border border-[#e2e6eb] bg-white">
            {top.length > 0 ? (
              top.map((game, index) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="flex items-center gap-4 border-b border-[#edf0f3] p-4 transition last:border-0 hover:bg-[#f3f6fa]"
                >
                  <span className="w-7 text-sm font-bold text-[#a1adbc]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-3xl">{game.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {game.title}
                    </p>
                    <p className="text-xs text-[#8995a5]">
                      {game.genre}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 font-bold text-[#d9a43d]">
                    <Star size={15} fill="currentColor" />
                    {stats[game.id].rating.toFixed(1)}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-[#8995a5]">
                {loading
                  ? "실제 평점을 불러오는 중..."
                  : error
                    ? "평점 정보를 불러오지 못했습니다."
                    : "아직 평가된 게임이 없습니다."}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-hand mb-6 text-4xl">
            <MessageCircle className="mr-2 inline text-[#6686b5]" />
            플레이어 리뷰
          </h2>

          <div className="space-y-3">
            {latestReviews.length > 0 ? (
              latestReviews.map((review) => {
                const game = games.find(
                  (item) => item.id === review.game_id
                );

                return (
                  <Link
                    key={review.id}
                    href={`/games/${review.game_id}`}
                    className="block rounded-2xl border border-[#e2e6eb] bg-white p-5 shadow-sm transition hover:bg-[#f8fafc]"
                  >
                    <div className="flex justify-between gap-3">
                      <span className="text-sm font-bold">
                        {game?.title ?? "게임"}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold text-[#d9a43d]">
                        <Star size={14} fill="currentColor" />
                        {review.score.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#6686b5]">
                      {review.title}
                    </p>

                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#66768b]">
                      “{review.body}”
                    </p>

                    <p className="mt-3 text-xs text-[#a1adbc]">
                      회원 {review.user_id.slice(0, 8)}
                      {" · "}
                      {new Date(
                        review.created_at
                      ).toLocaleDateString("ko-KR")}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl border border-[#e2e6eb] bg-white p-8 text-center text-sm text-[#8995a5]">
                {loading
                  ? "회원 리뷰를 불러오는 중..."
                  : error
                    ? "리뷰를 불러오지 못했습니다."
                    : "아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 하단 안내 */}
      <section className="mt-20 rounded-[28px] bg-[#e8edf4] p-9 text-center md:p-14">
        <Gamepad2 className="mx-auto text-[#6686b5]" size={42} />
        <h2 className="font-hand mt-4 text-4xl md:text-5xl">
          지금 어떤 게임을 하고 있나요?
        </h2>
        <p className="mt-4 text-sm text-[#66768b]">
          다음에 즐길 게임을 발견하고 나만의 기록을 남겨보세요.
        </p>
        <Link href="/games" className="gamelog-button mt-7">
          게임 탐색하기 <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
