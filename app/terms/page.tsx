
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Mail,
  Turtle,
} from "lucide-react";

const email = "3254lee@naver.com";
const policyVersion = "2026-11-25";

const sections = [
  {
    title: "제1조 목적",
    items: [
      "본 약관은 개인 운영자가 제공하는 LIKE TURTLE(거북이처럼)의 이용 조건과 운영자 및 이용자의 권리와 의무를 정하는 것을 목적으로 합니다.",
    ],
  },
  {
    title: "제2조 서비스의 내용",
    items: [
      "LIKE TURTLE은 육지거북 및 수생거북 사육 가이드, 커뮤니티, 성장일기 등의 서비스를 제공합니다.",
      "게시글 및 사육 가이드 열람은 비회원도 이용할 수 있으며, 게시글 작성, 댓글, 좋아요 및 성장일기 등의 기능은 로그인이 필요합니다.",
    ],
  },
  {
    title: "제3조 회원가입 및 계정 관리",
    items: [
      "이용자는 이용약관에 동의하고 개인정보 처리 안내를 확인한 후 회원가입을 신청할 수 있습니다.",
      "회원은 자신의 계정과 인증정보를 안전하게 관리해야 하며 다른 사람의 계정을 무단으로 이용해서는 안 됩니다.",
      "회원정보 변경 및 계정 관련 문의는 서비스 기능 또는 운영자 이메일을 통해 할 수 있습니다.",
      "개인정보의 처리에 관한 사항은 개인정보처리방침을 따릅니다.",
    ],
  },
  {
    title: "제4조 회원의 의무",
    items: [
      "회원은 관련 법령과 본 약관을 준수해야 합니다.",
      "욕설, 괴롭힘, 명예훼손, 개인정보 침해, 저작권 침해 및 불법 게시물 등록을 금지합니다.",
      "광고성 도배, 반복적인 스팸 게시물 등록, 허위정보 유포 등 정상적인 서비스 운영을 방해하는 행위를 금지합니다.",
      "동물학대에 해당하는 콘텐츠 및 불법적인 동물 거래를 조장하는 게시물을 등록해서는 안 됩니다.",
    ],
  },
  {
    title: "제5조 게시글 및 댓글의 권리",
    items: [
      "회원이 작성한 게시글, 댓글 및 사진 등에 대한 권리는 원칙적으로 해당 권리자에게 있습니다.",
      "회원은 자신이 등록하는 자료에 필요한 권리를 보유해야 하며 다른 사람의 저작권, 초상권, 개인정보 등을 침해해서는 안 됩니다.",
      "운영자는 서비스 제공에 필요한 범위에서 회원이 공개적으로 등록한 콘텐츠를 웹사이트에 표시할 수 있습니다.",
      "공개 게시글 및 댓글은 다른 이용자가 열람할 수 있으므로 개인정보가 포함되지 않도록 주의해야 합니다.",
    ],
  },
  {
    title: "제6조 성장일기 및 사진",
    items: [
      "회원은 반려 거북이의 성장 기록, 메모 및 사진 등을 등록할 수 있습니다.",
      "성장일기와 관련 사진에는 회원별 접근 권한을 적용합니다.",
      "회원은 다른 사람의 권리나 개인정보를 침해하는 자료를 등록해서는 안 됩니다.",
    ],
  },
  {
    title: "제7조 관리자 권한 및 게시물 관리",
    items: [
      "운영자는 커뮤니티의 정상적인 운영과 이용자 보호를 위해 관리자 계정을 운영합니다.",
      "관리자는 법령 위반, 타인의 권리 침해, 욕설, 광고성 도배, 불법 거래 또는 본 약관 위반에 해당하는 게시글과 댓글에 대해 필요한 삭제 조치를 할 수 있습니다.",
      "게시글을 삭제하면 해당 게시글에 연결된 첨부 사진, 댓글 및 좋아요도 함께 삭제될 수 있습니다.",
      "게시물 삭제 등 관리 조치는 관련 법령과 위반 내용의 정도를 고려하여 합리적으로 수행합니다.",
      "게시물 관리 및 권리 침해에 관한 문의는 운영자 이메일로 접수할 수 있습니다.",
    ],
  },
  {
    title: "제8조 회원 탈퇴",
    items: [
      "회원은 마이페이지의 탈퇴 요청 또는 운영자 이메일을 통해 탈퇴를 신청할 수 있습니다.",
      "문의 이메일: 3254lee@naver.com",
      "이메일 제목: LIKE TURTLE 회원 탈퇴 문의",
      "가입한 이메일 주소와 탈퇴 의사를 기재해 주세요. 비밀번호는 이메일로 보내지 마세요.",
      "운영자는 계정 소유 여부를 확인한 후 관련 개인정보 및 계정 삭제 절차를 진행합니다.",
    ],
  },
  {
    title: "제9조 회원 탈퇴 시 데이터 처리",
    items: [
      "회원 탈퇴 시 해당 회원이 작성한 내용을 삭제합니다. 다른 회원의 답글이 연결된 자리는 익명 안내로 대체하여 대화를 보존합니다.",
      "해당 회원의 좋아요, 성장일기, 거북이 정보 및 관련 사진도 삭제 대상에 포함합니다.",
      "관련 데이터를 처리한 후 회원 계정을 삭제합니다.",
      "법령상 보존 의무가 있는 정보는 필요한 범위에서 별도로 보존합니다.",
    ],
  },
  {
    title: "제10조 사육 정보의 이용",
    items: [
      "사이트에서 제공하는 사육 가이드는 일반적인 정보 제공을 목적으로 합니다.",
      "적절한 사육 방법은 거북이의 종류, 건강 상태 및 사육 환경에 따라 달라질 수 있습니다.",
      "반려 거북이에게 질병이나 응급 증상이 발생하면 수의사 등 적절한 전문가의 진료를 받으시기 바랍니다.",
    ],
  },
  {
    title: "제11조 서비스 이용 제한",
    items: [
      "운영자는 관련 법령이나 본 약관을 위반하거나 정상적인 서비스 운영을 현저히 방해하는 행위에 대해 합리적인 절차에 따른 이용 제한 조치를 할 수 있습니다.",
      "이용 제한이나 게시물 관리 조치에 대한 문의는 운영자 이메일로 접수할 수 있습니다.",
    ],
  },
  {
    title: "제12조 서비스 변경 및 종료",
    items: [
      "서비스는 유지보수, 보안 문제 또는 장애 등의 사유로 일시 중단될 수 있습니다.",
      "중요한 서비스 변경이나 종료가 예정된 경우 이용자가 확인할 수 있도록 적절한 방법으로 안내합니다.",
      "서비스 종료 시 개인정보는 관련 법령 및 개인정보처리방침에 따라 처리합니다.",
    ],
  },
  {
    title: "제13조 책임 및 분쟁 해결",
    items: [
      "운영자와 회원은 관련 법령 및 본 약관에 따른 책임을 부담합니다.",
      "본 약관은 법령상 인정되는 이용자의 권리를 제한하거나 운영자의 고의 또는 과실에 따른 법적 책임을 일률적으로 면제하지 않습니다.",
      "서비스 이용과 관련한 분쟁은 당사자 간 협의를 통해 해결하도록 노력하며, 해결되지 않는 경우 관련 법령에서 정한 절차에 따릅니다.",
    ],
  },
  {
    title: "제14조 약관의 변경",
    items: [
      "약관을 변경하는 경우 변경 내용 및 적용일을 웹사이트에 공개합니다.",
      "회원에게 불리한 중요한 변경사항은 관련 법령에 따른 고지 및 동의 절차를 진행합니다.",
    ],
  },
  {
    title: "제15조 운영자 정보",
    items: [
      "서비스명: LIKE TURTLE(거북이처럼)",
      "운영 형태: 개인 운영",
      "운영자 표시명: LIKE TURTLE 운영자",
      "문의 이메일: 3254lee@naver.com",
      "문서 버전: 2026-11-25",
    ],
  },
];

export default function TermsPage() {
  const mailto =
    `mailto:${email}?subject=` +
    encodeURIComponent("LIKE TURTLE 회원 탈퇴 문의");

  return (
    <main className="container-site min-w-0 pb-28 pt-7 text-[#405a46] md:pb-24 md:pt-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#668b6c]"
        >
          <ArrowLeft size={17} />
          홈으로 돌아가기
        </Link>

        <header className="mt-5 rounded-[24px] bg-[#eaf2e4] px-5 py-9 sm:rounded-[28px] sm:px-9 sm:py-12">
          <div className="flex items-center gap-2 text-[#668b6c]">
            <BookOpen size={23} />
            <span className="text-xs font-bold tracking-widest">
              TERMS OF SERVICE
            </span>
          </div>

          <h1 className="font-hand mt-5 text-3xl font-bold sm:text-4xl">
            이용약관
          </h1>

          <p className="mt-4 break-keep text-sm leading-7 text-[#718573]">
            거북이처럼에서 함께 소통하기 위한
            기본 이용 규칙입니다.
          </p>

          <p className="mt-3 text-xs text-[#829482]">
            문서 버전: {policyVersion}
          </p>
        </header>

        <div className="mt-6 rounded-[24px] border border-[#e3e9df] bg-white px-5 py-3 shadow-sm sm:px-9 sm:py-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-b border-[#edf0e9] py-6 last:border-b-0"
            >
              <h2 className="break-keep text-lg font-bold sm:text-xl">
                {section.title}
              </h2>

              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <p
                    key={item}
                    className="break-words text-[13px] leading-7 text-[#718573] sm:text-sm"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={mailto}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white hover:bg-[#527558]"
          >
            <Mail size={17} />
            회원 탈퇴 문의
          </a>

          <Link
            href="/privacy"
            className="text-xs font-semibold text-[#668b6c] hover:underline"
          >
            개인정보처리방침 보기
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#829482]">
            <Turtle size={18} />
            LIKE TURTLE · 거북이처럼
          </div>
        </div>
      </div>
    </main>
  );
}
