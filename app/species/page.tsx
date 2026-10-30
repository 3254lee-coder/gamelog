
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Droplets,
  Info,
  Leaf,
  Search,
  Sun,
  Thermometer,
  Turtle,
} from "lucide-react";

type Species = {
  name: string;
  english: string;
  scientific: string;
  group: string;
  region: string;
  size: string;
  level: string;
  climate: string;
  temperature: string;
  basking: string;
  humidity: string;
  diet: string;
  uvb: string;
  description: string;
  notes: string[];
  source: string;
  color: string;
};

const species: Species[] = [
  {
    name: "호스필드 육지거북",
    english: "Russian / Horsfield's Tortoise",
    scientific: "Testudo horsfieldii",
    group: "지중해·중앙아시아",
    region: "중앙아시아",
    size: "약 15~25cm",
    level: "입문 가능 · 장기 관리 필수",
    climate: "건조한 초원·반사막",
    temperature: "서늘한 구역 약 21~27°C",
    basking: "약 32~35°C",
    humidity: "건조한 표면과 습한 은신처 병행",
    diet: "잎채소·식용 야생초·고섬유질 식물",
    uvb: "필수 · 자연광 또는 적합한 UVB 조명",
    description:
      "작은 체형과 활발한 굴착 행동이 특징입니다. 흔히 러시안 육지거북이라고도 부릅니다.",
    notes: [
      "깊이 파고들 수 있는 바닥재를 마련하세요.",
      "울타리 아래를 파고 탈출하지 않도록 주의하세요.",
      "유체는 탈수 방지를 위한 습한 은신처가 중요합니다.",
      "동면은 개체 건강을 확인한 뒤 전문가 지도하에 검토하세요.",
    ],
    source: "https://www.tortoiseclub.org/information-sheets/",
    color: "#e7f0df",
  },
  {
    name: "동헤르만 육지거북",
    english: "Eastern Hermann's Tortoise",
    scientific: "Testudo hermanni boettgeri",
    group: "지중해·중앙아시아",
    region: "발칸반도 등 남동유럽",
    size: "대체로 약 18~28cm",
    level: "입문 가능 · 환경 관리 필요",
    climate: "지중해성 초원·관목지",
    temperature: "서늘한 구역 약 21~27°C",
    basking: "약 32~35°C",
    humidity: "통풍·배수 확보, 유체 습도 별도 관리",
    diet: "잎채소·식용 야생초 중심",
    uvb: "필수",
    description:
      "헤르만 육지거북의 동부 아종으로 서헤르만보다 크게 자라는 개체가 많습니다.",
    notes: [
      "아종에 따라 성체 크기와 무늬가 다릅니다.",
      "온도 구배와 충분한 활동 공간을 제공하세요.",
      "UVB와 칼슘 공급을 함께 관리하세요.",
      "동면 여부는 건강 상태와 사육 이력을 고려하세요.",
    ],
    source: "https://www.tortoise-den.co.uk/care-guides/care-sheets/",
    color: "#f4efdc",
  },
  {
    name: "서헤르만 육지거북",
    english: "Western Hermann's Tortoise",
    scientific: "Testudo hermanni hermanni",
    group: "지중해·중앙아시아",
    region: "서부 지중해 연안",
    size: "대체로 약 12~20cm",
    level: "입문 가능 · 환경 관리 필요",
    climate: "지중해성 관목지",
    temperature: "서늘한 구역 약 21~27°C",
    basking: "약 32~35°C",
    humidity: "통풍·배수 확보, 유체 습도 별도 관리",
    diet: "잎채소·식용 야생초 중심",
    uvb: "필수",
    description:
      "상대적으로 작은 체형이 특징인 헤르만 육지거북의 서부 아종입니다.",
    notes: [
      "동헤르만과 구분되는 아종 정보를 확인하세요.",
      "성체가 작더라도 넓은 활동 공간이 필요합니다.",
      "과도하게 건조한 유체 사육 환경을 피하세요.",
      "정확한 아종과 개체 출처를 확인하세요.",
    ],
    source: "https://www.tortoise-den.co.uk/care-guides/care-sheets/",
    color: "#f7eddc",
  },
  {
    name: "설카타 육지거북",
    english: "African Spurred Tortoise",
    scientific: "Centrochelys sulcata",
    group: "아프리카",
    region: "아프리카 사헬 지역",
    size: "약 60~80cm 이상 가능",
    level: "대형종 · 전문 시설 필요",
    climate: "반건조 초원·사헬",
    temperature: "따뜻한 구역 약 27~32°C",
    basking: "약 35~38°C",
    humidity: "유체의 습한 은신처와 수분 관리 중요",
    diet: "풀·고섬유질 초본식물 중심",
    uvb: "필수",
    description:
      "육지거북 중 매우 크게 자라는 종입니다. 강한 굴착력과 큰 성체 크기를 고려해야 합니다.",
    notes: [
      "성체 사육을 위한 넓은 야외·실내 시설이 필요합니다.",
      "겨울철 난방 비용과 시설 유지 능력을 확인하세요.",
      "유체를 극도로 건조하게 키우지 않도록 주의하세요.",
      "굴착에 의한 탈출과 시설 파손을 예방하세요.",
    ],
    source: "https://www.tortoiseclub.org/information-sheets/",
    color: "#f5e9d5",
  },
  {
    name: "마지나타 육지거북",
    english: "Marginated Tortoise",
    scientific: "Testudo marginata",
    group: "지중해·중앙아시아",
    region: "그리스 등 남유럽",
    size: "약 25~35cm",
    level: "중급 · 공간 확보 필요",
    climate: "지중해성 산지·관목지",
    temperature: "서늘한 구역 약 21~27°C",
    basking: "약 32~35°C",
    humidity: "배수·통풍 확보, 습한 은신처 제공",
    diet: "잎채소·식용 야생초 중심",
    uvb: "필수",
    description:
      "성체의 등갑 뒤쪽 가장자리가 치마처럼 벌어지는 독특한 외형이 특징입니다.",
    notes: [
      "지중해성 육지거북 중 비교적 크게 성장합니다.",
      "평탄한 공간과 일광욕 구역을 함께 제공하세요.",
      "어린 개체는 적절한 수분과 습도 관리가 필요합니다.",
      "동면은 건강 상태를 확인한 후 결정하세요.",
    ],
    source: "https://www.tortoise-den.co.uk/care-guides/care-sheets/",
    color: "#edeedc",
  },
  {
    name: "인도별거북",
    english: "Indian Star Tortoise",
    scientific: "Geochelone elegans",
    group: "남아시아·마다가스카르",
    region: "인도·스리랑카·파키스탄 일부",
    size: "약 20~35cm",
    level: "상급 · 환경 변화에 민감",
    climate: "건조·반건조 초원 및 관목지",
    temperature: "따뜻한 구역 약 24~29°C",
    basking: "약 30~35°C",
    humidity: "유체는 높은 습도·습한 은신처 필요",
    diet: "풀·잎채소·고섬유질 식물",
    uvb: "필수",
    description:
      "등갑의 아름다운 별무늬가 특징이며 온도와 습도 변화에 민감한 종입니다.",
    notes: [
      "초보 사육자에게 권장되지 않는 종입니다.",
      "저온과 과습이 동시에 발생하지 않도록 관리하세요.",
      "동면시키지 마세요.",
      "CITES 관련 서류와 국내 거래·보유 요건을 확인하세요.",
    ],
    source:
      "https://www.rvc.ac.uk/Media/Default/Beaumont%20Sainsbury%20Animal%20Hospital/EXOTICS/Animal%20Care%20Factsheets/Indian-star-tortoise-care-and-advice-Dec-2022-jh.pdf",
    color: "#f7ecd8",
  },
  {
    name: "레오파드 육지거북",
    english: "Leopard Tortoise",
    scientific: "Stigmochelys pardalis",
    group: "아프리카",
    region: "동부·남부 아프리카",
    size: "약 30~50cm 이상",
    level: "중상급 · 대형 사육장 필요",
    climate: "초원·사바나",
    temperature: "서늘한 구역 약 25~30°C",
    basking: "약 32~37°C",
    humidity: "유체 수분 관리, 습한 은신처 중요",
    diet: "풀·고섬유질 초본식물 중심",
    uvb: "필수",
    description:
      "표범 무늬처럼 아름다운 등갑을 가지며 성장하면서 무늬가 변할 수 있습니다.",
    notes: [
      "성체 크기를 고려해 넓은 공간을 확보하세요.",
      "저온 환경에 장시간 노출되지 않도록 하세요.",
      "유체의 탈수와 등갑 성장 상태를 관찰하세요.",
      "일반적으로 동면시키지 않습니다.",
    ],
    source: "https://www.tortoiseclub.org/information-sheets/",
    color: "#f1e9d7",
  },
  {
    name: "그리스 육지거북",
    english: "Greek / Spur-thighed Tortoise",
    scientific: "Testudo graeca",
    group: "지중해·중앙아시아",
    region: "남유럽·북아프리카·서아시아",
    size: "약 15~30cm",
    level: "중급 · 아종 확인 중요",
    climate: "초원·관목지·반건조 지역",
    temperature: "서늘한 구역 약 20~28°C",
    basking: "약 32~35°C",
    humidity: "아종·원산지별로 차이 큼",
    diet: "잎채소·식용 야생초 중심",
    uvb: "필수",
    description:
      "분포 범위가 넓어 지역별 개체군의 생태와 사육 조건에 차이가 있습니다.",
    notes: [
      "아종과 원산지에 맞는 환경을 확인하세요.",
      "모든 그리스 육지거북에 동일한 동면 기준을 적용하지 마세요.",
      "적절한 통풍과 온도 구배를 유지하세요.",
      "정확한 학명과 개체 출처를 확인하세요.",
    ],
    source:
      "https://www.merckvetmanual.com/multimedia/table/important-husbandry-requirements-for-selected-reptiles",
    color: "#f4eadd",
  },
  {
    name: "알다브라 코끼리 육지거북",
    english: "Aldabra Giant Tortoise",
    scientific: "Aldabrachelys gigantea",
    group: "아프리카",
    region: "세이셸 알다브라 환초",
    size: "약 90~120cm 이상",
    level: "전문 시설 · 초대형종",
    climate: "열대 초원·관목지",
    temperature: "따뜻한 열대 환경과 넓은 온도 구배",
    basking: "자연 일광욕 및 그늘 선택 공간",
    humidity: "그늘·수분·목욕 공간 확보",
    diet: "풀·잎·관목 등 식물성 먹이 중심",
    uvb: "충분한 자연광 또는 적합한 UVB 환경",
    description:
      "세계에서 가장 큰 육지거북 중 하나로, 매우 긴 수명과 거대한 체형이 특징입니다.",
    notes: [
      "일반 가정용 사육장에 적합하지 않습니다.",
      "넓은 야외 공간과 겨울철 대형 난방 시설이 필요합니다.",
      "과열을 피할 그늘과 물·진흙 목욕 공간을 제공하세요.",
      "장기적인 시설 운영과 전문 수의 관리가 필요합니다.",
    ],
    source:
      "https://nationalzoo.si.edu/animals/aldabra-tortoise",
    color: "#e6ede3",
  },
  {
    name: "마다가스카르 방사거북",
    english: "Radiated Tortoise",
    scientific: "Astrochelys radiata",
    group: "남아시아·마다가스카르",
    region: "마다가스카르 남부·남서부",
    size: "약 30~40cm",
    level: "상급 · 보전·거래 규정 중요",
    climate: "건조한 가시덤불 숲·관목지",
    temperature: "따뜻한 구역 약 25~30°C",
    basking: "약 32~35°C",
    humidity: "계절·성장 단계에 따른 조절 필요",
    diet: "풀·잎채소·식용 식물 중심",
    uvb: "필수",
    description:
      "등갑에 방사형으로 뻗은 황금빛 무늬가 특징인 마다가스카르 고유종입니다.",
    notes: [
      "국제 거래가 엄격하게 규제되는 보호종입니다.",
      "입양이나 양도 전 합법적인 개체 출처와 서류를 확인하세요.",
      "저온에 장시간 노출되지 않도록 주의하세요.",
      "온습도·UVB·먹이 관리를 정밀하게 유지하세요.",
    ],
    source:
      "https://archive.britishcheloniagroup.org.uk/caresheets/index",
    color: "#f6e9d6",
  },
  {
    name: "레드풋 육지거북",
    english: "Red-footed Tortoise",
    scientific: "Chelonoidis carbonarius",
    group: "남아메리카",
    region: "남아메리카 열대 지역",
    size: "약 25~40cm",
    level: "중급 · 고습도 관리",
    climate: "열대 숲·숲 가장자리",
    temperature: "서늘한 구역 약 25°C",
    basking: "약 35°C",
    humidity: "상대적으로 높은 습도, 환기 병행",
    diet: "다양한 식물성 먹이 중심, 종별 영양 관리",
    uvb: "필수",
    description:
      "다리의 붉거나 주황색 비늘이 특징이며 습윤한 열대 환경에 적응한 종입니다.",
    notes: [
      "건조지대 육지거북의 사육 조건을 그대로 적용하지 마세요.",
      "습한 은신처와 충분한 환기를 함께 제공하세요.",
      "식단은 건조지대 초식성 육지거북과 차이가 있습니다.",
      "동면시키지 않습니다.",
    ],
    source:
      "https://www.rvc.ac.uk/Media/Default/Beaumont%20Sainsbury%20Animal%20Hospital/EXOTICS/Animal%20Care%20Factsheets/Red%20foot%20tortoise%20care%202024%20jh.pdf",
    color: "#e6f0e4",
  },
  {
    name: "옐로우풋 육지거북",
    english: "Yellow-footed Tortoise",
    scientific: "Chelonoidis denticulatus",
    group: "남아메리카",
    region: "아마존 유역 등 남아메리카",
    size: "약 35~50cm 이상",
    level: "중상급 · 고습도·공간 필요",
    climate: "습윤한 열대우림",
    temperature: "서늘한 구역 약 23~26°C",
    basking: "약 30~32°C",
    humidity: "높은 습도와 충분한 환기 필요",
    diet: "다양한 식물성 먹이 중심, 종별 영양 관리",
    uvb: "필수",
    description:
      "다리의 노란 비늘과 비교적 큰 체형이 특징인 열대우림 육지거북입니다.",
    notes: [
      "레드풋보다 크게 성장하는 개체가 많습니다.",
      "건조한 사육 환경을 피하세요.",
      "습한 바닥재와 환기를 균형 있게 관리하세요.",
      "저온에 노출되지 않도록 하고 동면시키지 마세요.",
    ],
    source:
      "https://academy.herpeton.net/en/caresheets/tortoises/chelonoidis-denticulatus/",
    color: "#e8efdf",
  },
  {
    name: "팬케이크 육지거북",
    english: "Pancake Tortoise",
    scientific: "Malacochersus tornieri",
    group: "아프리카",
    region: "케냐·탄자니아",
    size: "약 13~20cm",
    level: "상급 · 특수 서식 환경",
    climate: "건조한 바위산·암석 틈",
    temperature: "서늘한 구역 약 24~29°C",
    basking: "약 35~40°C",
    humidity: "배수 좋은 바닥과 습한 은신처",
    diet: "풀·잎채소·식용 야생초 중심",
    uvb: "필수",
    description:
      "납작하고 유연한 등갑이 특징이며 바위틈에 몸을 밀어 넣어 숨는 독특한 습성이 있습니다.",
    notes: [
      "안전하고 무너지지 않는 바위형 은신처가 필요합니다.",
      "틈새를 오르는 능력이 좋아 탈출 방지가 중요합니다.",
      "유체는 습한 미세환경을 제공해야 합니다.",
      "특수한 서식 환경을 재현할 수 있는지 먼저 검토하세요.",
    ],
    source: "https://reptifiles.com/pancake-tortoise",
    color: "#f1e9dc",
  },
];

const groups = [
  "전체",
  "지중해·중앙아시아",
  "아프리카",
  "남아시아·마다가스카르",
  "남아메리카",
];

export default function SpeciesPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("전체");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return species.filter((item) => {
      const groupMatch =
        group === "전체" || item.group === group;

      const searchMatch =
        !keyword ||
        [
          item.name,
          item.english,
          item.scientific,
          item.region,
          item.climate,
        ].some((value) =>
          value.toLowerCase().includes(keyword)
        );

      return groupMatch && searchMatch;
    });
  }, [query, group]);

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
          거북이 도감
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#687c6b] md:text-base">
          다양한 육지거북의 특징부터 사육 환경까지.
          우리 거북이에게 필요한 정보를 천천히 알아봐요.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-[#62866a]">
          <BookOpen size={16} />
          총 {species.length}종 수록
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
          <Search size={20} className="text-[#8aa58b]" />
          <input
            id="species-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="거북이 이름이나 학명을 검색하세요"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {groups.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGroup(item)}
              aria-pressed={group === item}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                group === item
                  ? "bg-[#62866a] text-white"
                  : "border border-[#dfe9da] bg-white text-[#718873] hover:bg-[#edf4e9]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm text-[#849684]">
          검색 결과 {filtered.length}종
        </p>
      </section>

      <section className="mt-7 grid gap-5 md:grid-cols-2">
        {filtered.map((item) => {
          const isOpen = expanded === item.scientific;

          return (
            <article
              key={item.scientific}
              className="overflow-hidden rounded-[24px] border border-[#e3e9df] bg-white shadow-sm"
            >
              <div
                className="flex items-start gap-4 px-6 py-7"
                style={{ backgroundColor: item.color }}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#719273]">
                  <Turtle size={36} strokeWidth={1.6} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-hand text-2xl md:text-3xl">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#788b78]">
                    {item.english}
                  </p>
                  <p className="mt-1 text-xs italic text-[#788b78]">
                    {item.scientific}
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#eef4e9] px-3 py-1 text-xs text-[#638268]">
                    {item.group}
                  </span>
                  <span className="rounded-full bg-[#f6f0e4] px-3 py-1 text-xs text-[#947d56]">
                    {item.level}
                  </span>
                </div>

                <p className="text-sm leading-7 text-[#687c6b]">
                  {item.description}
                </p>

                <dl className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-3 border-t border-[#edf0e9] pt-5 text-sm">
                  <dt className="font-bold text-[#849984]">
                    원산지
                  </dt>
                  <dd>{item.region}</dd>

                  <dt className="font-bold text-[#849984]">
                    성체 크기
                  </dt>
                  <dd>{item.size}</dd>

                  <dt className="font-bold text-[#849984]">
                    서식 환경
                  </dt>
                  <dd>{item.climate}</dd>
                </dl>

                <div className="rounded-2xl bg-[#f7faf5] p-5">
                  <h3 className="mb-4 font-bold">
                    사육 환경 참고 정보
                  </h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Thermometer
                        size={19}
                        className="mt-1 shrink-0 text-[#b18467]"
                      />
                      <div>
                        <p className="font-bold">온도</p>
                        <p className="mt-1 leading-6 text-[#718573]">
                          {item.temperature}
                        </p>
                        <p className="leading-6 text-[#718573]">
                          바스킹: {item.basking}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Droplets
                        size={19}
                        className="mt-1 shrink-0 text-[#789bb4]"
                      />
                      <div>
                        <p className="font-bold">습도</p>
                        <p className="mt-1 leading-6 text-[#718573]">
                          {item.humidity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Leaf
                        size={19}
                        className="mt-1 shrink-0 text-[#7c9e7b]"
                      />
                      <div>
                        <p className="font-bold">먹이</p>
                        <p className="mt-1 leading-6 text-[#718573]">
                          {item.diet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Sun
                        size={19}
                        className="mt-1 shrink-0 text-[#c6a35e]"
                      />
                      <div>
                        <p className="font-bold">UVB</p>
                        <p className="mt-1 leading-6 text-[#718573]">
                          {item.uvb}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpanded(
                      isOpen ? null : item.scientific
                    )
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#edf4e9] px-4 py-3 text-sm font-bold text-[#5c8062] transition hover:bg-[#e2eddd]"
                >
                  {isOpen
                    ? "상세 주의사항 접기"
                    : "상세 사육 주의사항 보기"}
                  {isOpen ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </button>

                {isOpen && (
                  <div className="rounded-xl border border-[#e7eee3] p-5">
                    <h3 className="mb-3 text-sm font-bold">
                      사육 시 주의사항
                    </h3>

                    <ul className="space-y-3">
                      {item.notes.map((note) => (
                        <li
                          key={note}
                          className="flex items-start gap-2 text-sm leading-7 text-[#687c6b]"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8cac8c]" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#5e8665] underline underline-offset-4"
                    >
                      참고자료 보기
                    </a>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[#dce7d8] bg-white px-6 py-12 text-center">
          <Search
            size={30}
            className="mx-auto text-[#91a891]"
          />
          <p className="mt-4 text-sm text-[#718573]">
            검색 결과가 없습니다.
          </p>
        </div>
      )}

      <section className="mt-12 rounded-[24px] bg-[#faf5e8] p-6 md:p-8">
        <div className="flex items-center gap-2 text-[#9b794b]">
          <Info size={22} />
          <h2 className="font-bold">도감 이용 안내</h2>
        </div>

        <p className="mt-4 text-sm leading-8 text-[#776e5c]">
          이 도감은 사육 정보를 이해하기 위한 참고자료입니다.
          표시된 온도는 사육장 전체를 동일하게 유지하는
          설정값이 아닙니다. 따뜻한 구역과 서늘한 구역을
          마련하고, 바스킹 온도는 별도로 측정해야 합니다.
        </p>

        <p className="mt-3 text-sm leading-8 text-[#776e5c]">
          습도는 종·나이·은신처·바닥재에 따라 달라집니다.
          특히 유체에게는 충분한 수분과 적절한 습한
          미세환경이 중요합니다. UVB 조명도 제품별
          조사 거리와 강도를 확인해야 합니다.
        </p>

        <p className="mt-3 text-sm leading-8 text-[#776e5c]">
          사육 난이도는 공식 등급이 아닌 편의상 분류입니다.
          입양 전에는 CITES 및 국내 관련 규정과
          합법적인 개체 출처를 확인하세요.
          건강 이상은 파충류 진료가 가능한 수의사와
          상담하시기 바랍니다.
        </p>
      </section>
    </main>
  );
}
