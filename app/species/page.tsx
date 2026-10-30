
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Leaf,
  Search,
  Turtle,
  Info,
} from "lucide-react";

type Species = {
  id: string;
  name: string;
  english: string;
  scientific: string;
  region: string;
  size: string;
  lifespan: string;
  habitat: string;
  diet: string;
  features: string;
  care: string[];
  color: string;
  emoji: string;
};

const species: Species[] = [
  {
    id: "russian",
    name: "호스필드 육지거북",
    english: "Russian Tortoise",
    scientific: "Testudo horsfieldii",
    region: "중앙아시아의 건조한 초원과 반사막",
    size: "약 15~25cm",
    lifespan: "수십 년 이상",
    habitat: "건조한 초원·반사막",
    diet: "섬유질이 풍부한 잎채소와 적합한 야생초 중심",
    features:
      "작고 단단한 체형을 가진 육지거북으로, 땅을 파는 행동이 활발합니다. 앞발의 발톱이 보통 네 개이며 계절 변화에 적응하는 특성이 있습니다.",
    care: [
      "깊이 파고들 수 있는 안전한 바닥 환경을 준비하세요.",
      "사육장 탈출과 굴착으로 인한 구조물 붕괴를 예방하세요.",
      "건조한 지역 출신이지만 수분 공급과 적절한 습도 관리가 필요합니다.",
      "휴면·동면은 건강 상태와 사육 조건을 고려해 전문가와 상담하세요.",
    ],
    color: "#e8f0dd",
    emoji: "🌿",
  },
  {
    id: "hermann",
    name: "헤르만 육지거북",
    english: "Hermann's Tortoise",
    scientific: "Testudo hermanni",
    region: "남유럽 지중해 연안",
    size: "약 15~25cm",
    lifespan: "수십 년 이상",
    habitat: "지중해성 관목지·초원",
    diet: "다양한 잎채소와 섬유질이 풍부한 식물",
    features:
      "노란색과 검은색이 대비되는 등갑 무늬가 특징입니다. 아종과 개체에 따라 크기와 무늬가 달라집니다.",
    care: [
      "따뜻한 일광욕 구역과 서늘한 구역을 함께 마련하세요.",
      "UVB와 칼슘 공급을 적절히 관리하세요.",
      "안전한 야외 사육 환경을 제공할 경우 포식자와 탈출 위험을 확인하세요.",
      "습도와 바닥재는 연령과 사육 환경에 맞게 조절하세요.",
    ],
    color: "#f7efd9",
    emoji: "☀️",
  },
  {
    id: "greek",
    name: "그리스 육지거북",
    english: "Greek Tortoise",
    scientific: "Testudo graeca",
    region: "북아프리카·남유럽·서아시아",
    size: "약 15~30cm",
    lifespan: "수십 년 이상",
    habitat: "건조한 초원·관목지 등",
    diet: "섬유질이 풍부한 잎채소와 적합한 식물",
    features:
      "분포 지역이 넓고 지역별 개체군의 특징이 다양합니다. 사육 환경은 정확한 아종과 출신 지역에 따라 달라질 수 있습니다.",
    care: [
      "분양받은 개체의 아종과 출신 정보를 확인하세요.",
      "온습도를 일률적으로 적용하지 말고 개체군 특성을 고려하세요.",
      "과도한 습기나 부적절한 저온 환경을 피하세요.",
      "정기적으로 체중과 활동 상태를 확인하세요.",
    ],
    color: "#f3e8dc",
    emoji: "🍂",
  },
  {
    id: "sulcata",
    name: "설카타 육지거북",
    english: "African Spurred Tortoise",
    scientific: "Centrochelys sulcata",
    region: "아프리카 사헬 지역",
    size: "성체 등갑 길이 약 60~80cm 이상 가능",
    lifespan: "수십 년 이상",
    habitat: "건조한 초원·반건조 지역",
    diet: "고섬유질 풀과 적합한 초본식물 중심",
    features:
      "매우 크게 성장하는 육지거북으로 강한 굴착 능력을 가집니다. 작은 유체일 때의 크기만 보고 입양하면 장기적인 사육 공간 확보가 어려울 수 있습니다.",
    care: [
      "성체가 되었을 때 필요한 넓은 공간과 시설 비용을 먼저 검토하세요.",
      "추운 계절에도 적정 온도를 유지할 수 있는 시설이 필요합니다.",
      "유체는 탈수와 부적절한 습도 관리에 특히 주의해야 합니다.",
      "강한 굴착력과 체중을 고려해 울타리와 시설을 설계하세요.",
    ],
    color: "#f5e9d7",
    emoji: "🏜️",
  },
  {
    id: "leopard",
    name: "레오파드 육지거북",
    english: "Leopard Tortoise",
    scientific: "Stigmochelys pardalis",
    region: "동부·남부 아프리카",
    size: "약 30~50cm, 더 큰 개체도 있음",
    lifespan: "수십 년 이상",
    habitat: "초원·사바나",
    diet: "섬유질이 풍부한 풀과 적합한 식물 중심",
    features:
      "표범 무늬를 연상시키는 등갑 패턴이 특징입니다. 성장하면서 등갑 무늬와 색이 달라질 수 있으며 비교적 큰 사육 공간이 필요합니다.",
    care: [
      "성체 크기를 고려한 충분한 이동 공간을 확보하세요.",
      "저온 환경에 장시간 노출되지 않도록 관리하세요.",
      "적절한 UVB, 온도 구배, 칼슘 공급을 유지하세요.",
      "성장기에 체중과 등갑 발달 상태를 꾸준히 기록하세요.",
    ],
    color: "#f2eddd",
    emoji: "🌾",
  },
  {
    id: "redfoot",
    name: "붉은발 육지거북",
    english: "Red-footed Tortoise",
    scientific: "Chelonoidis carbonarius",
    region: "남아메리카 열대 지역",
    size: "약 25~40cm",
    lifespan: "수십 년 이상",
    habitat: "습윤한 숲·숲 가장자리·사바나",
    diet: "다양한 식물성 먹이를 중심으로 종 특성에 맞춘 식단",
    features:
      "다리의 붉거나 주황색 비늘이 특징입니다. 건조지대 육지거북과 달리 상대적으로 습한 환경에 적응한 종입니다.",
    care: [
      "건조지대 육지거북과 동일한 습도 기준을 적용하지 마세요.",
      "습도뿐 아니라 충분한 환기와 청결도 함께 관리하세요.",
      "식단은 건조지대 초식성 육지거북과 차이가 있으므로 종별 자료를 확인하세요.",
      "은신처와 깨끗한 물을 항상 제공하세요.",
    ],
    color: "#e6efe6",
    emoji: "🍃",
  },
];

export default function SpeciesPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return species;

    return species.filter((item) =>
      [
        item.name,
        item.english,
        item.scientific,
        item.region,
        item.habitat,
      ].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [query]);

  return (
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      <section className="mt-7 rounded-[28px] bg-[#eaf2e4] px-7 py-12 md:px-12 md:py-16">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle size={24} />
          <span className="text-xs font-bold tracking-[0.18em]">
            TORTOISE ENCYCLOPEDIA
          </span>
        </div>

        <h1 className="font-hand mt-5 text-4xl leading-tight md:text-6xl">
          세상에는 어떤
          <br />
          거북이 친구들이 있을까요?
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-8 text-[#687c6b] md:text-base">
          호스필드부터 설카타까지.
          다양한 육지거북의 특징과 서식 환경,
          사육 시 주의할 점을 알아보세요.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#62866a]">
          <BookOpen size={16} />
          육지거북 {species.length}종 소개
        </div>
      </section>

      <section className="mt-10">
        <label
          htmlFor="species-search"
          className="mb-3 block text-sm font-bold"
        >
          거북이 검색
        </label>

        <div className="flex items-center gap-3 rounded-2xl border border-[#dce7d8] bg-white px-4 py-3 focus-within:border-[#8cad8c]">
          <Search size={21} className="text-[#8aa58b]" />
          <input
            id="species-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름이나 학명을 검색해 보세요"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#9caa9b]"
          />
        </div>
      </section>

      <section className="mt-9 grid gap-5 md:grid-cols-2">
        {filtered.map((item) => {
          const isOpen = expanded === item.id;

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[24px] border border-[#e3e9df] bg-white shadow-sm"
            >
              <div
                className="flex items-center gap-4 px-6 py-7"
                style={{ backgroundColor: item.color }}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white/70">
                  <Turtle size={37} className="text-[#719273]" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-hand text-2xl md:text-3xl">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#788b78]">
                    {item.english}
                  </p>
                  <p className="mt-1 text-xs italic text-[#8c9c89]">
                    {item.scientific}
                  </p>
                </div>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="grid grid-cols-[88px_1fr] gap-3 text-sm">
                  <span className="font-semibold text-[#789079]">
                    분포 지역
                  </span>
                  <span>{item.region}</span>

                  <span className="font-semibold text-[#789079]">
                    성체 크기
                  </span>
                  <span>{item.size}</span>

                  <span className="font-semibold text-[#789079]">
                    수명
                  </span>
                  <span>{item.lifespan}</span>

                  <span className="font-semibold text-[#789079]">
                    서식 환경
                  </span>
                  <span>{item.habitat}</span>
                </div>

                <div className="border-t border-[#edf0e9] pt-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <Leaf size={17} className="text-[#7d9e7f]" />
                    먹이 특징
                  </div>
                  <p className="text-sm leading-7 text-[#6e816f]">
                    {item.diet}
                  </p>
                </div>

                <p className="text-sm leading-7 text-[#6e816f]">
                  {item.features}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isOpen ? null : item.id)
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#edf4e9] px-4 py-3 text-sm font-bold text-[#5c8062] transition hover:bg-[#e2eddd]"
                >
                  {isOpen ? "주의사항 접기" : "사육 시 주의사항 보기"}
                  {isOpen ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </button>

                {isOpen && (
                  <div className="rounded-xl bg-[#f7faf5] p-5">
                    <ul className="space-y-3">
                      {item.care.map((care) => (
                        <li
                          key={care}
                          className="flex items-start gap-2 text-sm leading-7 text-[#617563]"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8cac8c]" />
                          {care}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[#dce7d8] bg-white px-6 py-12 text-center">
          <Search size={30} className="mx-auto text-[#91a891]" />
          <p className="mt-4 text-sm text-[#718573]">
            검색 결과가 없습니다. 다른 이름으로 검색해 보세요.
          </p>
        </div>
      )}

      <section className="mt-12 rounded-[24px] bg-[#faf5e8] p-6 md:p-8">
        <div className="flex items-center gap-2 text-[#9b794b]">
          <Info size={22} />
          <h2 className="font-bold">도감 이용 안내</h2>
        </div>

        <p className="mt-4 text-sm leading-8 text-[#776e5c]">
          도감에 표시된 크기와 수명은 일반적인 참고 범위이며,
          아종·성별·개체·사육 환경에 따라 차이가 있습니다.
          사육 온도와 습도, UVB, 먹이 구성은 종과 성장 단계에 따라
          달라지므로 도감 정보만으로 사육 조건을 결정하지 마세요.
        </p>

        <p className="mt-3 text-sm leading-8 text-[#776e5c]">
          입양 전에는 해당 종의 거래 및 보유 관련 규정과
          필요한 서류를 확인해야 합니다.
        </p>
      </section>
    </main>
  );
}
