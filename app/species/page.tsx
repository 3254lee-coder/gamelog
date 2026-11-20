
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Droplets,
  HeartPulse,
  Salad,
  Sun,
  Thermometer,
  Turtle,
  Waves,
} from "lucide-react";

const guides = [
  {
    id: "preparation",
    title: "01. 입양 전 준비",
    subtitle: "종에 맞는 사육 환경부터 준비하기",
    icon: Turtle,
    color: "#eaf1f8",
    items: [
      "입양하려는 거북이의 정확한 종과 성체 크기를 확인하세요.",
      "완전 수생, 반수생 등 생활 방식에 따라 필요한 시설이 달라집니다.",
      "성체까지 고려한 수조와 안전한 설치 공간을 준비하세요.",
      "사육 종에 적합한 수온 관리 장치와 조명 등을 마련하세요.",
      "파충류 진료가 가능한 동물병원과 합법적인 분양 여부를 확인하세요.",
    ],
  },
  {
    id: "tank",
    title: "02. 수조와 사육 환경",
    subtitle: "안전하고 충분한 생활 공간",
    icon: Waves,
    color: "#e9f3f5",
    items: [
      "거북이가 움직이고 헤엄칠 수 있도록 충분한 공간을 확보하세요.",
      "수심과 수조 구조는 종의 수영 능력과 성장 단계에 맞춰 조정하세요.",
      "휴식을 취하거나 물 밖으로 나올 수 있는 장소가 필요한 종에는 안전한 발판을 설치하세요.",
      "수조에 끼이거나 전도될 수 있는 장식물과 탈출 위험을 점검하세요.",
      "여과기, 히터, 전기 설비가 거북이에게 손상을 주지 않도록 설치하세요.",
    ],
  },
  {
    id: "water",
    title: "03. 여과와 수질관리",
    subtitle: "깨끗한 물은 건강한 사육의 기본",
    icon: Droplets,
    color: "#e8f1fa",
    items: [
      "사육 환경에 맞는 충분한 여과 성능을 확보하세요.",
      "물속 암모니아와 아질산염 등 수질 상태를 정기적으로 확인하세요.",
      "오염 정도와 여과 상태에 따라 부분 환수와 청소를 실시하세요.",
      "새 물을 사용할 때에는 염소 처리와 수온 차이를 확인하세요.",
      "먹이 찌꺼기와 배설물을 관리하고 여과재를 적절하게 유지하세요.",
    ],
  },
  {
    id: "lighting",
    title: "04. 일광욕과 UVB",
    subtitle: "빛과 체온 조절을 위한 공간",
    icon: Sun,
    color: "#fcf4dc",
    items: [
      "해당 종에 필요한 UVB 조명과 일광욕용 열원을 준비하세요.",
      "일광욕을 하는 종에는 몸을 충분히 말릴 수 있는 안전한 장소를 설치하세요.",
      "조명 설치 거리와 사용 시간은 제조사 지침 및 종별 요구사항에 맞추세요.",
      "유리나 플라스틱에 의해 UVB 전달이 제한될 수 있다는 점에 유의하세요.",
      "수온과 일광욕 구역의 온도를 별도로 확인하고 화상을 예방하세요.",
    ],
  },
  {
    id: "feeding",
    title: "05. 먹이와 영양",
    subtitle: "종과 성장 단계에 맞는 식단",
    icon: Salad,
    color: "#edf4e6",
    items: [
      "수생거북의 식성은 종과 성장 단계에 따라 다릅니다.",
      "해당 종에 적합한 전용 사료와 먹이 구성을 확인하세요.",
      "필요한 칼슘과 영양소가 충분히 공급되는지 점검하세요.",
      "한 종류의 먹이나 생먹이에만 의존하는 식단은 피하세요.",
      "급여량과 먹이 반응을 관찰하고 수조의 먹이 찌꺼기를 관리하세요.",
    ],
  },
  {
    id: "health",
    title: "06. 건강관리",
    subtitle: "작은 변화를 매일 기록하기",
    icon: HeartPulse,
    color: "#f9ece9",
    items: [
      "체중, 등갑 크기, 식욕과 활동량의 변화를 기록하세요.",
      "눈과 피부, 등갑, 호흡 상태를 정기적으로 관찰하세요.",
      "비정상적으로 기울어 떠 있거나 호흡에 이상이 있으면 진료를 받으세요.",
      "새로 입양한 개체는 기존 개체와 분리해 건강 상태를 확인하세요.",
      "질병이 의심되면 임의로 약물을 사용하지 말고 파충류 전문 수의사와 상담하세요.",
    ],
  },
];

export default function AquaticGuidePage() {
  return (
    <main className="container-site min-h-screen min-w-0 pb-28 pt-5 text-[#405a46] sm:pt-9 md:pb-24">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      {/* 소개 */}
      <section className="mt-4 rounded-[22px] bg-[#eaf1f8] px-5 py-8 sm:mt-7 sm:rounded-[28px] sm:px-7 sm:py-12 md:px-12 md:py-16">
        <div className="flex items-center gap-2 text-[#6c8ca9]">
          <Waves size={23} />
          <span className="text-[10px] font-bold tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]">
            AQUATIC TURTLE CARE GUIDE
          </span>
        </div>

        <h1 className="font-hand mt-4 break-keep text-[30px] leading-[1.4] sm:mt-5 sm:text-4xl md:text-6xl">
          수생거북 사육 가이드
        </h1>

        <p className="mt-4 max-w-2xl break-keep text-[13px] leading-7 text-[#687c6b] sm:mt-6 sm:text-sm sm:leading-8 md:text-base">
          수조 준비부터 여과와 수질관리,
          일광욕과 UVB, 먹이와 건강관리까지.
          수생거북과 반수생거북을 위한 기본 내용을 정리했습니다.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#6c8ca9]">
          <BookOpen size={16} />
          초보 사육자를 위한 기초 안내
        </div>
      </section>

      {/* 목차 */}
      <section id="aquatic-guide-top" className="mt-9 scroll-mt-24 sm:mt-12">
        <h2 className="font-hand mb-5 text-[28px] sm:text-3xl md:text-4xl">
          수생거북 사육 목차
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <a
                key={guide.id}
                href={`#${guide.id}`}
                className="flex min-h-[88px] min-w-0 flex-col items-start justify-center gap-2 rounded-2xl border border-[#e5e9e0] bg-white p-3 transition hover:border-[#9eb89f] hover:bg-[#f7faf5] sm:min-h-[68px] sm:flex-row sm:items-center sm:gap-3 sm:p-4"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
                  style={{ backgroundColor: guide.color }}
                >
                  <Icon size={21} className="text-[#62866a]" />
                </span>

                <span className="min-w-0 flex-1 break-keep text-[12px] font-bold leading-5 sm:text-sm">
                  {guide.title}
                </span>

                <ArrowRight
                  size={17}
                  className="hidden shrink-0 text-[#9aad9a] sm:block"
                />
              </a>
            );
          })}
        </div>
      </section>

      {/* 내용 */}
      <section className="mt-9 space-y-4 sm:mt-12 sm:space-y-6">
        {guides.map((guide) => {
          const Icon = guide.icon;

          return (
            <article
              key={guide.id}
              id={guide.id}
              className="scroll-mt-24 overflow-hidden rounded-[20px] border border-[#e5e9e0] bg-white shadow-sm sm:rounded-[24px]"
            >
              <div
                className="flex items-center gap-3 px-4 py-5 sm:gap-4 sm:px-6 sm:py-6 md:px-8"
                style={{ backgroundColor: guide.color }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/75 text-[#62866a] sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Icon size={25} />
                </span>

                <div className="min-w-0">
                  <h2 className="font-hand break-keep text-[25px] leading-tight sm:text-3xl">
                    {guide.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#687c6b] sm:text-sm">
                    {guide.subtitle}
                  </p>
                </div>
              </div>

              <ul className="space-y-4 px-4 py-6 sm:px-6 sm:py-7 md:px-8">
                {guide.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[13px] leading-7 text-[#617263] sm:text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[10px] h-2 w-2 shrink-0 rounded-full bg-[#8eae8f]"
                    />
                    <span className="min-w-0 break-keep">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-[#f0f3ed] px-4 py-2 text-right sm:hidden">
                <a
                  href="#aquatic-guide-top"
                  className="inline-flex min-h-10 items-center text-xs font-semibold text-[#62866a]"
                >
                  목차로 돌아가기
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {/* 안내 */}
      <section className="mt-10 rounded-[22px] border border-[#e6e2d4] bg-[#faf5e8] p-5 sm:p-8">
        <div className="flex items-center gap-2 text-[#9c7843]">
          <AlertCircle size={22} />
          <h2 className="text-lg font-bold">꼭 기억해 주세요</h2>
        </div>

        <p className="mt-4 break-keep text-[13px] leading-7 text-[#776d59] sm:text-sm sm:leading-8">
          수생거북과 반수생거북도 종에 따라 수영 능력,
          필요한 수심, 수온, 식단, 일광욕 습성이 다릅니다.
          이 페이지는 일반적인 안내이며,
          구체적인 환경은 반드시 해당 종에 맞춰야 합니다.
        </p>

        <p className="mt-3 break-keep text-[13px] leading-7 text-[#776d59] sm:text-sm sm:leading-8">
          건강 이상이 의심되면 파충류 진료가 가능한
          수의사에게 상담하세요.
        </p>
      </section>

      <section className="mt-12 rounded-[22px] bg-[#e7efe1] px-5 py-9 text-center sm:rounded-[28px] sm:px-7 sm:py-12">
        <Thermometer size={37} className="mx-auto text-[#62866a]" />

        <h2 className="font-hand mt-4 text-[29px] sm:text-4xl">
          건강한 환경부터 시작해요.
        </h2>

        <p className="mt-4 text-[13px] leading-7 text-[#687c6b] sm:text-sm">
          우리 거북이에게 맞는 환경을 만들고
          매일 작은 변화를 관찰해 주세요.
        </p>

        <Link
          href="/guide"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#62866a] px-6 py-3 text-sm font-bold text-white"
        >
          육지거북 가이드 보기
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
