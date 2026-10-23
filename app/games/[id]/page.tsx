
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MessageSquareText,
  CalendarDays,
  Gamepad2,
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

  const hasSampleRating = game.reviews > 0;

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
          {/* 게임 이미지 또는 임시 일러스트 */}
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

            {/* 게임 통계 */}
            <div className="mt-9 grid grid-cols-2 gap-4 border-t border-[#edf0f3] pt-7 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[#8995a5]">
                  유저 평점 · 샘플
                </p>

                {hasSampleRating ? (
                  <p className="mt-2 flex items-center gap-1.5 text-2xl font-extrabold text-[#d9a43d]">
                    <Star size={22} fill="currentColor" />
                    {game.rating.toFixed(1)}
                    <span className="text-xs font-normal text-[#8995a5]">
                      / 10
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#6686b5]">
                    <Star size={20} />
                    평가 전
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-[#8995a5]">
                  리뷰 수 · 샘플
                </p>
                <p className="mt-2 flex items-center gap-2 text-xl font-bold">
                  <MessageSquareText
                    size={20}
                    className="text-[#6686b5]"
                  />
                  {hasSampleRating
                    ? game.reviews.toLocaleString()
                    : "아직 없음"}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
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
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#f3f6fa] p-4">
              <Gamepad2
                size={20}
                className="mt-0.5 shrink-0 text-[#6686b5]"
              />
              <p className="text-xs leading-6 text-[#66768b]">
                {hasSampleRating
                  ? "위 평점과 리뷰 수는 샘플 데이터입니다. 실제 회원들이 작성한 리뷰와 평점은 아래에서 확인할 수 있습니다."
                  : "아직 등록된 샘플 평점이 없습니다. 아래에서 첫 리뷰를 작성해 보세요. 실제 회원 리뷰와 평점은 아래 리뷰 영역에서 확인할 수 있습니다."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 실제 회원 리뷰 기능 유지 */}
      <ReviewSection gameId={game.id} />
    </main>
  );
}
