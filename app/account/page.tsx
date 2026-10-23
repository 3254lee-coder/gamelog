
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  MessageCircle,
  Star,
  UserRound,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { games } from "@/lib/games";

type Row = {
  id: string;
  game_id: string;
  score: number;
  title: string;
  body: string;
};

export default function Account() {
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const db = getSupabase();

      if (!db) {
        setError("Supabase 설정이 필요합니다.");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await db.auth.getUser();

      if (!active) return;

      if (authError || !data.user) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      setEmail(data.user.email ?? "");

      const { data: reviews, error: reviewError } = await db
        .from("reviews")
        .select("id,game_id,score,title,body")
        .eq("user_id", data.user.id)
        .order("updated_at", { ascending: false });

      if (!active) return;

      if (reviewError) {
        setError(reviewError.message);
      } else {
        setRows(reviews ?? []);
      }

      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="container-site min-h-[70vh] pb-24 pt-12 text-[#384b61]">
      <div className="mb-10">
        <p className="text-xs font-bold tracking-[.2em] text-[#6686b5]">
          MY GAMELOG
        </p>

        <h1 className="font-hand mt-3 text-4xl md:text-5xl">
          나의 게임 기록
        </h1>

        <p className="mt-3 text-sm text-[#8493a6]">
          내가 남긴 게임의 추억을 모아보는 공간
        </p>
      </div>

      <section className="rounded-[28px] border border-[#e2e6eb] bg-white p-7 shadow-sm md:p-9">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8edf4] text-[#6686b5]">
            <UserRound size={31} strokeWidth={1.7} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-widest text-[#9ba9b8]">
              PLAYER PROFILE
            </p>

            <h2 className="mt-2 break-all text-lg font-bold">
              {email || (loading ? "불러오는 중..." : "게이머")}
            </h2>

            <p className="mt-1 text-sm text-[#8493a6]">
              GAMELOG와 함께하는 게임 기록
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#f3f6fa] px-5 py-4">
            <MessageCircle size={22} className="text-[#6686b5]" />
            <div>
              <p className="text-xs text-[#8493a6]">작성한 리뷰</p>
              <p className="text-xl font-extrabold">{rows.length}개</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.2em] text-[#6686b5]">
              MY REVIEWS
            </p>

            <h2 className="font-hand mt-2 text-3xl md:text-4xl">
              <BookOpen
                size={29}
                className="mr-2 inline text-[#e7b94c]"
              />
              내가 남긴 이야기
            </h2>
          </div>

          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6686b5] hover:underline"
          >
            게임 둘러보기 <ArrowRight size={16} />
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-[#f1d7c4] bg-[#fff8f1] p-5 text-sm text-[#a16b4e]"
          >
            {error}
            {error === "로그인이 필요합니다." && (
              <Link
                href="/login"
                className="ml-3 font-bold underline"
              >
                로그인하기
              </Link>
            )}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-sm text-[#8493a6]">
            리뷰를 불러오는 중입니다...
          </p>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="mt-7 rounded-[28px] border border-dashed border-[#cfd9e5] bg-white px-6 py-16 text-center">
            <Gamepad2
              size={48}
              strokeWidth={1.5}
              className="mx-auto text-[#6686b5]"
            />

            <h3 className="font-hand mt-5 text-2xl">
              아직 남긴 이야기가 없어요!
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#8493a6]">
              재미있게 플레이한 게임을 찾아
              <br />
              첫 번째 리뷰를 작성해 보세요.
            </p>

            <Link
              href="/games"
              className="gamelog-button mt-7"
            >
              게임 탐색하기 <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {rows.map((review) => {
              const game = games.find(
                (item) => item.id === review.game_id
              );

              return (
                <Link
                  key={review.id}
                  href={`/games/${review.game_id}`}
                  className="group rounded-2xl border border-[#e2e6eb] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-widest text-[#6686b5]">
                        GAME REVIEW
                      </p>

                      <h3 className="mt-2 truncate text-lg font-bold">
                        {game?.title ?? review.game_id}
                      </h3>
                    </div>

                    <span className="flex shrink-0 items-center gap-1 font-bold text-[#d9a43d]">
                      <Star size={17} fill="currentColor" />
                      {review.score.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-[#edf0f3] pt-5">
                    <p className="font-bold">{review.title}</p>

                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#66768b]">
                      {review.body}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-1 text-xs font-semibold text-[#6686b5]">
                    리뷰 보러가기
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
