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
    <main className="container-site min-h-screen min-w-0 pb-28 pt-5 text-[#405a46] sm:pt-9 md:pb-24">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
