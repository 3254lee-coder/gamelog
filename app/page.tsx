
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Heart,
  MessageCircle,
  NotebookPen,
  Sparkles,
  Turtle,
} from "lucide-react";

const categories = [
  {
    title: "사육 가이드",
    description: "처음 키우는 분들을 위한 필수 정보",
    details: "사육장 · 온습도 · UVB · 먹이",
    icon: BookOpen,
    background: "#edf5e8",
    color: "#608566",
    href: "/guide",
  },
  {
    title: "거북이 도감",
    description: "다양한 육지거북 친구들을 만나보세요",
    details: "호스필드 · 헤르만 · 설카타 · 별거북 외 13종",
    icon: Turtle,
    background: "#f8f0df",
    color: "#a18558",
    href: "/species",
  },
  {
    title: "커뮤니티",
    description: "질문하고 일상을 나누는 공간",
    details: "질문 · 정보 공유 · 사진",
    icon: MessageCircle,
    background: "#eaf1f8",
    color: "#6c8ca9",
    href: "/community",
  },
  {
    title: "성장일기",
    description: "우리 거북이의 소중한 기록",
    details: "거북이 등록 · 체중 · 등갑 길이 · 성장 그래프",
    icon: NotebookPen,
    background: "#f8ebed",
    color: "#b27d8b",
    href: "/growth",
  },
];

export default function HomePage() {
  return (
    <main className="container-site min-h-screen min-w-0 pb-28 pt-4 text-[#405a46] sm:pt-8 md:pb-24">
      {/* 메인 카툰 배너 */}
      <section className="overflow-hidden rounded-[20px] bg-[#edf4e7] shadow-sm sm:rounded-[28px]">
        <Image
          src="/tortoise-hero.png"
          alt="거북이처럼 - 조금 느리면 어때. 풀밭을 걷는 육지거북 카툰"
          width={1645}
          height={386}
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="h-auto w-full"
        />
      </section>

      {/* 환영 문구 */}
      <section className="px-1 pb-3 pt-9 text-center sm:px-2 sm:pb-5 sm:pt-12">
        <div className="mb-4 flex items-center justify-center gap-2 text-[#86a58a]">
          <Sparkles size={16} className="shrink-0 sm:h-[19px] sm:w-[19px]" />
          <span className="text-[10px] font-bold tracking-[0.12em] sm:text-xs sm:tracking-[0.18em]">
            WELCOME TO OUR LITTLE WORLD
          </span>
          <Sparkles size={16} className="shrink-0 sm:h-[19px] sm:w-[19px]" />
        </div>

        <h1 className="font-hand text-[30px] leading-[1.4] sm:text-4xl sm:leading-tight md:text-5xl">
          거북이와 함께하는
          <br className="sm:hidden" /> 느리고 따뜻한 일상
        </h1>

        <p className="mx-auto mt-4 max-w-2xl break-keep text-[13px] leading-7 text-[#788b79] sm:mt-5 sm:text-sm sm:leading-8 md:text-base">
          처음 거북이를 키우는 분도,
          <br className="sm:hidden" />
          오랫동안 함께해 온 분도 환영해요.
          <br className="hidden sm:block" />
          서로 배우고, 질문하고, 작은 성장을
          <br className="sm:hidden" />
          함께 기록하는 공간입니다.
        </p>
      </section>

      {/* 주요 카테고리 */}
      <section className="mt-8 sm:mt-9">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold tracking-[0.16em] text-[#8ca18a] sm:mb-2 sm:text-xs">
              EXPLORE
            </p>
            <h2 className="font-hand text-[28px] leading-tight sm:text-3xl md:text-4xl">
              무엇을 해볼까요?
            </h2>
          </div>

          <span className="shrink-0 text-[11px] text-[#9ba99a] sm:text-xs">
            천천히 둘러보세요
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group flex min-h-[190px] min-w-0 flex-col rounded-[20px] border border-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:min-h-[230px] sm:rounded-[24px] sm:p-6"
                style={{
                  backgroundColor: category.background,
                }}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/75 sm:h-14 sm:w-14 sm:rounded-2xl"
                    style={{ color: category.color }}
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.7}
                      className="sm:h-[30px] sm:w-[30px]"
                    />
                  </div>

                  <ArrowRight
                    size={18}
                    className="shrink-0 transition group-hover:translate-x-1 sm:h-[22px] sm:w-[22px]"
                    style={{ color: category.color }}
                  />
                </div>

                <div className="mt-auto pt-5 sm:mt-8 sm:pt-0">
                  <h3 className="font-hand text-[23px] leading-tight sm:text-3xl">
                    {category.title}
                  </h3>

                  <p className="mt-2 break-keep text-[12px] leading-5 text-[#687c6b] sm:text-sm sm:leading-7">
                    {category.description}
                  </p>

                  <p className="mt-3 hidden text-xs text-[#8c9b8a] sm:mt-4 sm:block">
                    {category.details}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-3 text-center text-[11px] text-[#91a391] sm:hidden">
          원하는 메뉴를 눌러 둘러보세요.
        </p>
      </section>

      {/* 사이트 소개 */}
      <section className="mt-11 rounded-[22px] border border-[#e5ecdf] bg-[#f8faf5] px-5 py-7 sm:mt-16 sm:rounded-[28px] sm:px-7 sm:py-11 md:px-12">
        <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row md:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e5efdf] text-[#739578] sm:h-20 sm:w-20 sm:rounded-[24px]">
            <Turtle
              size={34}
              strokeWidth={1.5}
              className="sm:h-[45px] sm:w-[45px]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#91a590] sm:text-xs">
              OUR STORY
            </p>

            <h2 className="font-hand mt-2 text-[28px] sm:text-3xl md:text-4xl">
              조금 느리면 어때
            </h2>

            <p className="mt-3 break-keep text-[13px] leading-7 text-[#738674] sm:mt-4 sm:text-sm sm:leading-8">
              거북이의 속도에 맞춰 천천히 배우고,
              소중한 순간을 함께 나누는 곳.
              <br className="hidden sm:block" />
              「거북이처럼」은 모든 육지거북과 사육자를 위한
              따뜻한 커뮤니티를 꿈꿉니다.
            </p>
          </div>
        </div>
      </section>

      {/* 커뮤니티 바로가기 */}
      <section className="mt-11 sm:mt-16">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold tracking-[0.16em] text-[#8ca18a] sm:mb-2 sm:text-xs">
              COMMUNITY
            </p>

            <h2 className="font-hand text-[28px] sm:text-3xl md:text-4xl">
              우리들의 이야기
            </h2>
          </div>

          <Link
            href="/community"
            className="inline-flex min-h-10 shrink-0 items-center gap-1 text-[12px] font-bold text-[#668b6c] hover:text-[#405a46] sm:gap-2 sm:text-sm"
          >
            전체 게시글
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="rounded-[22px] border border-[#d8e4d3] bg-white px-4 py-9 text-center sm:rounded-[24px] sm:px-6 sm:py-12">
          <Camera
            size={32}
            className="mx-auto text-[#94af95] sm:h-[34px] sm:w-[34px]"
          />

          <h3 className="font-hand mt-4 text-[24px] sm:text-2xl">
            거북이 이야기를 나눠보세요!
          </h3>

          <p className="mt-3 break-keep text-[13px] leading-6 text-[#829483] sm:text-sm sm:leading-7">
            우리 거북이의 사진과 일상을 공유하고,
            <br className="hidden sm:block" />
            궁금한 점을 자유롭게 질문할 수 있어요.
          </p>

          <Link
            href="/community"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#527558] sm:mt-7 sm:px-7"
          >
            커뮤니티 둘러보기
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* 하단 안내 */}
      <section className="mt-11 rounded-[22px] bg-[#e9f1e5] px-5 py-9 text-center sm:mt-16 sm:rounded-[28px] sm:px-7 sm:py-12">
        <Heart
          size={27}
          className="mx-auto text-[#84a487] sm:h-[29px] sm:w-[29px]"
        />

        <h2 className="font-hand mx-auto mt-4 max-w-xl break-keep text-[27px] leading-snug sm:text-3xl md:text-4xl">
          함께하면 더 즐거운 거북이 생활
        </h2>

        <p className="mx-auto mt-4 max-w-md break-keep text-[13px] leading-7 text-[#718573] sm:text-sm">
          작은 궁금증도 편하게 나눌 수 있는 공간을
          만들어가고 있습니다.
        </p>

        <Link
          href="/community"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#527558] sm:mt-7"
        >
          함께하기
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
