
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Search,
  MessageCircle,
  Camera,
  ArrowRight,
  Heart,
  Megaphone,
  Turtle,
  Leaf,
} from "lucide-react";

const categories = [
  {
    title: "사육 가이드",
    description: "처음 키우는 분들을 위한 필수 정보",
    icon: BookOpen,
    background: "#edf5e8",
    color: "#608566",
    details: "사육장 · 온습도 · UVB · 먹이",
  },
  {
    title: "거북이 도감",
    description: "다양한 육지거북의 특징을 알아봐요",
    icon: Search,
    background: "#fbf3e5",
    color: "#ad8554",
    details: "호스필드 · 헤르만 · 설카타 외",
  },
  {
    title: "커뮤니티",
    description: "질문과 정보, 일상을 함께 나눠요",
    icon: MessageCircle,
    background: "#eaf3f9",
    color: "#6689a2",
    details: "질문 · 자유게시판 · 사진 자랑",
  },
  {
    title: "성장일기",
    description: "우리 거북이의 오늘을 기록해요",
    icon: Camera,
    background: "#fcf0ec",
    color: "#c48a79",
    details: "사진 · 몸무게 · 성장 기록",
  },
];

export default function Home() {
  return (
    <main className="container-site pb-24 text-[#405a46]">
      {/* 카툰 메인 배너 */}
      <section className="relative mt-7 overflow-hidden rounded-[28px] border border-[#e4e8dc] bg-[#edf4e7] shadow-sm">
        <Image
          src="/tortoise-hero.png"
          alt="거북이처럼 - 조금 느리면 어때. 풀밭을 걷는 귀여운 육지거북 카툰"
          width={1645}
          height={386}
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="h-auto w-full"
        />
      </section>

      {/* 카테고리 */}
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <Leaf size={23} className="text-[#759b75]" />
          <h2 className="font-hand text-3xl md:text-4xl">
            거북이처럼 함께해요
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.title}
                className="relative flex min-h-[230px] flex-col overflow-hidden rounded-[24px] border border-white/80 p-6 shadow-sm"
                style={{
                  backgroundColor: category.background,
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75"
                  style={{ color: category.color }}
                >
                  <Icon size={27} strokeWidth={1.8} />
                </div>

                <h3 className="font-hand mt-5 text-3xl text-[#405a46]">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#667768]">
                  {category.description}
                </p>

                <p className="mt-auto pt-5 text-xs text-[#8a9b89]">
                  {category.details}
                </p>

                <div
                  className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/75"
                  style={{ color: category.color }}
                  aria-hidden="true"
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-[#8a9b89]">
          각 카테고리의 상세 페이지는 순차적으로 열릴 예정입니다.
        </p>
      </section>

      {/* 소개 */}
      <section className="mt-16 rounded-[28px] bg-[#f1f5ed] px-7 py-10 md:px-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#759b75]">
            <Turtle size={33} strokeWidth={1.6} />
          </div>

          <h2 className="font-hand text-4xl md:text-5xl">
            조금 느리면 어때
          </h2>

          <p className="max-w-xl text-sm leading-8 text-[#687c6b] md:text-base">
            모든 육지거북과 보호자를 위한 작은 공간.
            <br />
            처음 키우는 분들도 편하게 배우고,
            <br />
            우리 거북이의 소중한 순간을 함께 나눠요.
          </p>
        </div>
      </section>

      {/* 공지 및 커뮤니티 안내 */}
      <section className="mt-16 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#e5e9e0] bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Megaphone size={22} className="text-[#bd925a]" />
            <h2 className="font-hand text-3xl">
              공지사항
            </h2>
          </div>

          <div className="border-t border-[#edf0ea] pt-5">
            <p className="text-sm font-bold text-[#405a46]">
              거북이처럼 커뮤니티를 준비하고 있습니다.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#788879]">
              사육 정보와 사진 성장일기,
              질문 게시판을 차례대로 준비하고 있습니다.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#e5e9e0] bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Heart size={22} className="text-[#df998e]" />
            <h2 className="font-hand text-3xl">
              커뮤니티 소식
            </h2>
          </div>

          <div className="border-t border-[#edf0ea] pt-5">
            <p className="text-sm font-bold text-[#405a46]">
              우리 거북이의 이야기를 기다립니다.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#788879]">
              게시판 기능이 완성되면
              회원들이 직접 사진과 이야기를 올리고
              서로 댓글을 남길 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 하단 안내 */}
      <section className="mt-16 rounded-[28px] bg-[#e7efe1] px-7 py-12 text-center md:py-16">
        <Turtle
          size={43}
          strokeWidth={1.6}
          className="mx-auto text-[#62866a]"
        />

        <h2 className="font-hand mt-4 text-4xl md:text-5xl">
          우리, 천천히 함께 걸어요.
        </h2>

        <p className="mt-4 text-sm leading-7 text-[#687c6b]">
          육지거북의 일상과 사육 정보를
          함께 기록하는 따뜻한 공간
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#62866a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4d7054]"
        >
          회원으로 함께하기
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
