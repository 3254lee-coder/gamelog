
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Star,
  Sparkles,
  Crown,
  MessageCircle,
  PenLine,
} from "lucide-react";
import { games, recentReviews } from "@/lib/games";

export default function Home() {
  const featured = games.slice(0, 4);
  const top = [...games].sort((a, b) => b.rating - a.rating);

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
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group overflow-hidden rounded-2xl border border-[#e2e6eb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="flex aspect-[3/4] flex-col items-center justify-center gap-5 p-5"
                style={{
                  background: `linear-gradient(145deg, ${game.accent}33, #e8edf4)`,
                }}
              >
                <span className="text-7xl transition group-hover:scale-110">
                  {game.icon}
                </span>
                <span className="text-center text-sm font-extrabold text-[#384b61]">
                  {game.title}
                </span>
              </div>

              <div className="p-4">
                <h3 className="truncate text-sm font-bold">
                  {game.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#8995a5]">
                    {game.genre}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d9a43d]">
                    <Star size={14} fill="currentColor" />
                    {game.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 평점과 리뷰 */}
      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-hand mb-6 text-4xl">
            <Crown className="mr-2 inline text-[#e7b94c]" />
            높은 평점의 게임
          </h2>

          <div className="overflow-hidden rounded-2xl border border-[#e2e6eb] bg-white">
            {top.slice(0, 5).map((game, index) => (
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
                  <p className="truncate text-sm font-bold">{game.title}</p>
                  <p className="text-xs text-[#8995a5]">{game.genre}</p>
                </div>
                <span className="flex items-center gap-1 font-bold text-[#d9a43d]">
                  <Star size={15} fill="currentColor" />
                  {game.rating.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-hand mb-6 text-4xl">
            <MessageCircle className="mr-2 inline text-[#6686b5]" />
            플레이어 리뷰
          </h2>

          <div className="space-y-3">
            {recentReviews.map((review, index) => (
              <div
                key={`${review.user}-${index}`}
                className="rounded-2xl border border-[#e2e6eb] bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between gap-3">
                  <span className="text-sm font-bold">{review.game}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d9a43d]">
                    <Star size={14} fill="currentColor" />
                    {review.score.toFixed(1)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-[#66768b]">
                  “{review.text}”
                </p>
                <p className="mt-3 text-xs text-[#a1adbc]">
                  {review.user} · {review.time}
                </p>
              </div>
            ))}
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
