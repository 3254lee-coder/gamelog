
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
    href: "",
  },
  {
    title: "성장일기",
    description: "우리 거북이의 소중한 기록",
    details: "사진 · 체중 · 성장 기록",
    icon: NotebookPen,
    background: "#f8ebed",
    color: "#b27d8b",
    href: "",
  },
];

export default function HomePage() {
  return (
    <main className="container-site min-h-screen pb-24 pt-8 text-[#405a46]">
      {/* 메인 카툰 배너 */}
      <section className="overflow-hidden rounded-[28px] bg-[#edf4e7] shadow-sm">
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
      <section className="px-2 pb-5 pt-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-2 text-[#86a58a]">
          <Sparkles size={19} />
          <span className="text-xs font-bold tracking-[0.18em]">
            WELCOME TO OUR LITTLE WORLD
          </span>
          <Sparkles size={19} />
        </div>

        <h1 className="font-hand text-4xl leading-tight md:text-5xl">
          거북이와 함께하는
          <br className="sm:hidden" /> 느리고 따뜻한 일상
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#788b79] md:text-base">
          처음 거북이를 키우는 분도,
          오랫동안 함께해 온 분도 환영해요.
          <br className="hidden sm:block" />
          서로 배우고, 질문하고, 작은 성장을 함께 기록하는 공간입니다.
        </p>
      </section>

      {/* 주요 카테고리 */}
      <section className="mt-9">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.16em] text-[#8ca18a]">
              EXPLORE
            </p>
            <h2 className="font-hand text-3xl md:text-4xl">
              무엇을 해볼까요?
            </h2>
          </div>
          <span className="text-xs text-[#9ba99a]">
            천천히 둘러보세요
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => {
            const Icon = category.icon;

            const cardContent = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75"
                    style={{ color: category.color }}
                  >
                    <Icon size={30} strokeWidth={1.7} />
                  </div>

                  {category.href ? (
                    <ArrowRight
                      size={22}
                      style={{ color: category.color }}
                    />
                  ) : (
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#8b9989]">
                      준비 중
                    </span>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="font-hand text-3xl">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#687c6b]">
                    {category.description}
                  </p>

                  <p className="mt-4 text-xs text-[#8c9b8a]">
                    {category.details}
                  </p>
                </div>
              </>
            );

            if (category.href) {
              return (
                <Link
                  key={category.title}
                  href={category.href}
                  className="flex min-h-[230px] flex-col rounded-[24px] border border-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  style={{ backgroundColor: category.background }}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={category.title}
                className="flex min-h-[230px] flex-col rounded-[24px] border border-white/80 p-6 shadow-sm"
                style={{ backgroundColor: category.background }}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </section>

      {/* 사이트 소개 */}
      <section className="mt-16 rounded-[28px] border border-[#e5ecdf] bg-[#f8faf5] px-7 py-11 md:px-12">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-[#e5efdf] text-[#739578]">
            <Turtle size={45} strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.16em] text-[#91a590]">
              OUR STORY
            </p>

            <h2 className="font-hand mt-2 text-3xl md:text-4xl">
              조금 느리면 어때
            </h2>

            <p className="mt-4 text-sm leading-8 text-[#738674]">
              거북이의 속도에 맞춰 천천히 배우고,
              소중한 순간을 함께 나누는 곳.
              <br />
              「거북이처럼」은 모든 육지거북과 사육자를 위한
              따뜻한 커뮤니티를 꿈꿉니다.
            </p>
          </div>
        </div>
      </section>

      {/* 커뮤니티 미리보기 */}
      <section className="mt-16">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-[#8ca18a]">
            COMMUNITY
          </p>
          <h2 className="font-hand text-3xl md:text-4xl">
            우리들의 이야기
          </h2>
        </div>

        <div className="rounded-[24px] border border-dashed border-[#d8e4d3] bg-white px-6 py-12 text-center">
          <Camera
            size={34}
            className="mx-auto text-[#94af95]"
          />

          <h3 className="font-hand mt-4 text-2xl">
            곧 만나요!
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#829483]">
            우리 거북이의 사진과 일상을 공유하고,
            궁금한 점을 자유롭게 질문할 수 있는
            커뮤니티를 준비하고 있어요.
          </p>
        </div>
      </section>

      {/* 하단 안내 */}
      <section className="mt-16 rounded-[28px] bg-[#e9f1e5] px-7 py-12 text-center">
        <Heart
          size={29}
          className="mx-auto text-[#84a487]"
        />

        <h2 className="font-hand mt-4 text-3xl md:text-4xl">
          함께하면 더 즐거운 거북이 생활
        </h2>

        <p className="mt-4 text-sm leading-7 text-[#718573]">
          작은 궁금증도 편하게 나눌 수 있는 공간을
          만들어가고 있습니다.
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#527558]"
        >
          함께하기
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
