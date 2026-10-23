
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { games } from "@/lib/games";
import ReviewSection from "@/components/review-section";

export function generateStaticParams() {
  return games.map((game) => ({ id: game.id }));
}

export default async function GameDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = games.find((g) => g.id === id);

  if (!game) notFound();

  return (
    <main className="container-site min-h-[65vh] pb-24 pt-10 text-[#384b61]">
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#6686b5] transition hover:text-[#384b61]"
      >
        <ArrowLeft size={17} />
        게임 목록으로
      </Link>

      <section className="mt-7 overflow-hidden rounded-[28px] border border-[#e2e6eb] bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          {/* 게임 포스터 */}
          <div className="relative min-h-[420px] overflow-hidden bg-[#e8edf4]">
            {game.image ? (
              <Image
                src={game.image}
                alt={`${game.title} 손그림 포스터`}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8"
                style={{
                  backgroundColor: `${game.accent}33`,
                }}
              >
                <span
                  className="select-none text-8xl"
                  role="img"
                  aria-label={`${game.title} 게임 아이콘`}
                >
                  {game.icon}
                </span>

                <div className="rounded-full bg-white/80 px-5 py-2 text-xs font-bold tracking-widest text-[#6686b5]">
                  NEW GAME
                </div>

                <p className="max-w-full break-words text-center text-sm font-bold tracking-wide text-[#384b61]">
                  {game.englishTitle}
                </p>
              </div>
            )}
          </div>

          {/* 게임 정보 */}
          <div className="flex flex-col p-7 md:p-10">
            <div className="flex items-center gap-2 text-[#6686b5]">
              <Sparkles size={18} />
              <span className="text-xs font-bold tracking-[0.2em]">
                GAME STORY
              </span>
            </div>

            <p className="mt-7 text-xs font-bold tracking-[0.15em] text-[#8995a5]">
              {game.englishTitle}
            </p>

            <h1 className="font-hand mt-3 text-4xl leading-tight md:text-5xl">
              {game.title}
            </h1>

            <div className="mt-4 h-1.5 w-28 rotate-[-2deg] rounded-full bg-[#f2c86b]" />

            <p className="mt-7 text-sm leading-8 text-[#66768b] md:text-base">
              {game.description}
            </p>

            {/* 플랫폼 */}
            <div className="mt-7 flex flex-wrap gap-2">
              {game.platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-[#d6e1ee] bg-[#eef3f9] px-3 py-1.5 text-xs font-semibold text-[#6686b5]"
                >
                  {platform}
                </span>
              ))}
            </div>

            {/* 장르 및 출시연도 */}
            <div className="mt-9 border-t border-[#edf0f3] pt-7">
              <p className="text-xs text-[#8995a5]">
                장르 / 출시연도
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold">
                <CalendarDays
                  size={17}
                  className="text-[#6686b5]"
                />
                {game.genre} · {game.year}
              </p>
            </div>

            {/* 실제 회원 평점 안내 */}
            <div className="mt-8 rounded-2xl bg-[#f3f6fa] p-5">
              <p className="text-sm font-bold text-[#384b61]">
                플레이어들의 실제 평가
              </p>
              <p className="mt-2 text-xs leading-6 text-[#66768b]">
                GAMELOG 회원들이 직접 작성한 리뷰와
                평균 별점은 아래에서 확인할 수 있습니다.
                리뷰를 작성하거나 수정하면 평가 결과에
                반영됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 실제 회원 리뷰 및 평균 평점 */}
      <ReviewSection gameId={game.id} />
    </main>
  );
}
