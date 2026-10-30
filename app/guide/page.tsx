
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  House,
  Sun,
  Thermometer,
  Salad,
  HeartPulse,
  ClipboardCheck,
  AlertCircle,
  Turtle,
} from "lucide-react";

const guides = [
  {
    id: "preparation",
    title: "01. 입양 전 준비",
    subtitle: "거북이를 데려오기 전에",
    icon: House,
    color: "#eaf2e6",
    items: [
      "키우려는 육지거북의 정확한 종과 성체 크기를 확인하세요.",
      "성장 후에도 사용할 수 있는 충분한 사육 공간을 계획하세요.",
      "온도 조절 장치, UVB 조명, 은신처, 물그릇을 준비하세요.",
      "파충류 진료가 가능한 동물병원을 미리 알아두세요.",
      "합법적인 분양 여부와 필요한 서류를 확인하세요.",
    ],
  },
  {
    id: "environment",
    title: "02. 사육 환경",
    subtitle: "안전하고 편안한 보금자리",
    icon: Thermometer,
    color: "#f8f0e2",
    items: [
      "사육장 안에 따뜻한 구역과 서늘한 구역을 구분하세요.",
      "온도계와 습도계를 이용해 실제 환경을 측정하세요.",
      "종과 성장 단계에 맞는 바닥재와 습도를 유지하세요.",
      "화상이나 탈출 위험이 없는지 정기적으로 점검하세요.",
      "거북이가 몸을 숨길 수 있는 은신처를 마련하세요.",
    ],
  },
  {
    id: "lighting",
    title: "03. 조명과 UVB",
    subtitle: "건강한 성장에 필요한 빛",
    icon: Sun,
    color: "#fcf4dc",
    items: [
      "사육 종에 적합한 UVB 조명과 열원을 선택하세요.",
      "제조사 지침에 맞게 조명 거리와 설치 위치를 조정하세요.",
      "유리나 플라스틱이 UVB를 차단할 수 있다는 점에 유의하세요.",
      "조명 사용 시간과 교체 주기를 관리하세요.",
      "열원이 거북이에게 직접 닿지 않도록 보호하세요.",
    ],
  },
  {
    id: "feeding",
    title: "04. 먹이와 영양",
    subtitle: "올바른 식단 만들기",
    icon: Salad,
    color: "#edf4e6",
    items: [
      "육지거북은 종에 따라 적합한 식단이 다릅니다.",
      "키우는 종에 맞는 잎채소와 야생초 등을 확인하세요.",
      "칼슘 공급과 UVB 환경을 함께 관리하세요.",
      "과일이나 고단백 먹이를 임의로 주식으로 사용하지 마세요.",
      "항상 깨끗한 물을 이용할 수 있도록 하세요.",
    ],
  },
  {
    id: "health",
    title: "05. 건강관리",
    subtitle: "매일 작은 변화를 살펴봐요",
    icon: HeartPulse,
    color: "#f9ece9",
    items: [
      "체중과 등갑 길이를 일정한 방법으로 기록하세요.",
      "먹이 섭취량과 활동량의 변화를 관찰하세요.",
      "눈, 코, 입, 등갑과 피부 상태를 확인하세요.",
      "호흡 이상, 지속적인 식욕 저하, 심한 무기력 등이 나타나면 파충류 진료가 가능한 수의사에게 상담하세요.",
      "새로 입양한 개체는 기존 개체와 분리해 건강 상태를 확인하세요.",
    ],
  },
];

export default function GuidePage() {
  return (
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      <section className="mt-7 rounded-[28px] bg-[#edf4e7] px-7 py-12 md:px-12 md:py-16">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle size={23} />
          <span className="text-xs font-bold tracking-[0.18em]">
            TORTOISE CARE GUIDE
          </span>
        </div>

        <h1 className="font-hand mt-5 text-4xl leading-tight md:text-6xl">
          처음 키우는 육지거북,
          <br />
          무엇부터 준비할까요?
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-8 text-[#687c6b] md:text-base">
          육지거북과 함께하는 첫걸음.
          입양 준비부터 사육 환경, 먹이와 건강관리까지
          꼭 알아야 할 기본 내용을 정리했습니다.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#62866a]">
          <BookOpen size={16} />
          초보 사육자를 위한 기초 안내
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <ClipboardCheck size={23} className="text-[#62866a]" />
          <h2 className="font-hand text-3xl md:text-4xl">
            사육 가이드 목차
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guide.icon;

            return (
              <a
                key={guide.id}
                href={`#${guide.id}`}
                className="flex items-center gap-3 rounded-2xl border border-[#e5e9e0] bg-white p-4 transition hover:border-[#9eb89f] hover:bg-[#f7faf5]"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: guide.color }}
                >
                  <Icon size={22} className="text-[#62866a]" />
                </span>

                <span className="min-w-0 flex-1 text-sm font-bold">
                  {guide.title}
                </span>

                <ArrowRight size={17} className="text-[#9aad9a]" />
              </a>
            );
          })}
        </div>
      </section>

      <section className="mt-12 space-y-6">
        {guides.map((guide) => {
          const Icon = guide.icon;

          return (
            <article
              key={guide.id}
              id={guide.id}
              className="scroll-mt-28 overflow-hidden rounded-[24px] border border-[#e5e9e0] bg-white shadow-sm"
            >
              <div
                className="flex items-center gap-4 px-6 py-6 md:px-8"
                style={{ backgroundColor: guide.color }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 text-[#62866a]">
                  <Icon size={27} />
                </span>

                <div>
                  <h2 className="font-hand text-3xl">
                    {guide.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#687c6b]">
                    {guide.subtitle}
                  </p>
                </div>
              </div>

              <ul className="space-y-4 px-6 py-7 md:px-8">
                {guide.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-7 text-[#617263]"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8eae8f]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="mt-10 rounded-[24px] border border-[#e6e2d4] bg-[#faf5e8] p-6 md:p-8">
        <div className="flex items-center gap-2 text-[#9c7843]">
          <AlertCircle size={22} />
          <h2 className="text-lg font-bold">
            꼭 기억해 주세요
          </h2>
        </div>

        <p className="mt-4 text-sm leading-8 text-[#776d59]">
          이 페이지는 육지거북 사육의 일반적인 기초 안내입니다.
          호스필드, 헤르만, 설카타, 레오파드 등은
          서식 환경과 성장 크기, 필요한 온습도 및 식단이 다릅니다.
          구체적인 사육 조건은 반드시 해당 종과 개체 상태에 맞춰
          확인해야 합니다.
        </p>

        <p className="mt-3 text-sm leading-8 text-[#776d59]">
          건강 이상이 의심된다면 온라인 정보만으로 판단하지 말고
          파충류 진료가 가능한 수의사에게 상담하세요.
        </p>
      </section>

      <section className="mt-12 rounded-[28px] bg-[#e7efe1] px-7 py-12 text-center">
        <Turtle
          size={40}
          className="mx-auto text-[#62866a]"
        />

        <h2 className="font-hand mt-4 text-4xl">
          천천히, 하나씩 배워가요.
        </h2>

        <p className="mt-4 text-sm leading-7 text-[#687c6b]">
          거북이와 함께하는 매일이
          건강하고 즐거운 시간이 되기를 바랍니다.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#62866a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4d7054]"
        >
          홈으로 돌아가기
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
