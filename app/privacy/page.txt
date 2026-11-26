
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Turtle,
} from "lucide-react";

const email = "3254lee@naver.com";
const policyVersion = "2026-11-25";

const sections = [
  {
    title: "1. 개인정보의 처리 목적",
    items: [
      "LIKE TURTLE(거북이처럼)은 회원가입, 로그인, 회원 관리, 커뮤니티 운영, 성장일기 제공, 서비스 보안 및 이용자 문의 처리를 위해 개인정보를 처리합니다.",
      "서비스 제공 계약의 체결 및 이행에 필요한 개인정보는 개인정보 보호법 제15조 제1항 제4호에 따른 범위에서 처리하며, 별도의 동의가 필요한 경우 관련 법령에 따른 동의를 받습니다.",
    ],
  },
  {
    title: "2. 처리하는 개인정보 항목",
    items: [
      "회원가입 및 인증: 이메일 주소, 비밀번호 관련 인증정보, 닉네임, 회원 식별번호, 가입일시, 약관 동의 및 개인정보 처리 안내 확인 기록",
      "커뮤니티 이용: 작성자 식별정보, 닉네임, 게시글, 댓글, 좋아요, 첨부 사진 및 작성일시",
      "성장일기 이용: 회원 식별정보, 거북이 이름과 종류, 생일 및 입양일, 성장 기록, 메모 및 첨부 사진",
      "문의 처리: 이용자가 이메일 문의 시 제공하는 이메일 주소 및 문의 내용",
      "서비스 제공 과정에서 IP 주소, 접속기록, 오류기록 등 기술적 정보가 처리될 수 있습니다.",
      "비밀번호 인증은 Supabase Auth를 이용하며 운영자는 이용자에게 이메일로 비밀번호 제공을 요구하지 않습니다.",
      "게시글, 사진 및 성장일기 등록은 이용자가 해당 기능을 선택하여 사용하는 경우에 처리됩니다.",
    ],
  },
  {
    title: "3. 개인정보의 처리 및 보유 기간",
    items: [
      "회원 인증정보 및 프로필: 회원 탈퇴 시까지",
      "게시글, 댓글, 좋아요, 성장일기 및 거북이 정보와 사진: 이용자의 삭제 또는 회원 탈퇴 시까지",
      "문의 정보: 문의 처리 목적이 달성되어 더 이상 보유할 필요가 없을 때까지",
      "법령상 보존 의무가 있는 정보는 해당 법령이 정한 기간 동안 필요한 범위에서 별도 보존합니다.",
      "외부 서비스 제공업체가 처리하는 기술적 로그 및 백업의 구체적인 보유 기간은 해당 서비스의 실제 운영 조건에 따라 확인이 필요합니다.",
    ],
  },
  {
    title: "4. 공개 및 비공개 정보",
    items: [
      "커뮤니티에 등록한 게시글, 댓글 및 첨부 사진은 다른 이용자에게 공개될 수 있습니다.",
      "커뮤니티 사진은 공개 저장소에 저장되므로 사진 주소를 알고 있는 이용자가 열람할 수 있습니다.",
      "성장일기와 거북이 관련 사진은 회원별 접근 권한을 적용하여 관리하며, 성장일기 사진은 비공개 저장소를 이용합니다.",
      "공개 게시글과 댓글에 본인 또는 다른 사람의 민감한 개인정보를 포함하지 않도록 주의해 주세요.",
    ],
  },
  {
    title: "5. 개인정보의 제3자 제공",
    items: [
      "운영자는 개인정보의 제3자 제공이 필요한 경우 관련 법령에서 정한 적법한 근거와 절차에 따라 처리합니다.",
      "별도 동의가 필요한 제3자 제공은 제공받는 자, 제공 목적, 항목 및 보유 기간 등을 안내하고 동의를 받습니다.",
    ],
  },
  {
    title: "6. 개인정보 처리위탁 및 국외 이전",
    items: [
      "서비스 제공에 이용하는 외부 서비스는 다음과 같습니다.",
      "Supabase: 회원 인증, 데이터베이스 및 사진 파일 저장. 데이터베이스 프로젝트는 대한민국 서울 리전(ap-northeast-2)을 사용합니다.",
      "Vercel: 웹사이트 배포, 호스팅 및 서비스 제공에 필요한 기술적 처리.",
      "Supabase의 데이터베이스가 서울에 위치하더라도 일부 서비스 운영, 기술적 지원 또는 로그 처리가 국외에서 이루어질 수 있습니다.",
      "Vercel 역시 서비스 제공 과정에서 국외 데이터 처리가 이루어질 수 있습니다.",
      "국외 이전에 관한 구체적인 이전 국가, 이전받는 자, 연락처, 이전 항목, 시기와 방법, 목적, 보유 기간 및 이전 거부 방법은 실제 계약과 처리 환경에 따라 확인해야 합니다.",
    ],
  },
  {
    title: "7. 회원 탈퇴 및 개인정보 삭제",
    items: [
      "회원은 3254lee@naver.com으로 탈퇴를 신청할 수 있습니다.",
      "이메일 제목은 LIKE TURTLE 회원 탈퇴 문의로 작성하고 가입 이메일 주소와 탈퇴 의사를 기재해 주세요. 비밀번호는 보내지 마세요.",
      "운영자는 계정 소유 여부를 확인한 후 회원 탈퇴 절차를 진행합니다.",
      "회원 탈퇴 시 해당 회원이 작성한 커뮤니티 게시글, 댓글, 좋아요, 성장일기, 거북이 정보 및 관련 사진을 삭제하는 것을 원칙으로 합니다.",
      "게시글 삭제에 따라 해당 게시글에 연결된 다른 회원의 댓글과 좋아요도 삭제될 수 있습니다.",
      "관련 데이터와 사진 파일을 정리한 후 회원 계정을 삭제합니다.",
      "다만 관련 법령에 따라 보존해야 하는 정보는 필요한 범위에서 별도로 보존합니다.",
    ],
  },
  {
    title: "8. 개인정보의 파기 방법",
    items: [
      "개인정보가 불필요하게 되었을 때에는 관련 법령에 따라 지체 없이 파기합니다.",
      "데이터베이스의 개인정보 기록을 삭제하고 관련 사진은 파일 저장소에서 삭제합니다.",
      "전자적 개인정보는 복구 또는 재생되지 않도록 적절한 방법으로 파기합니다.",
      "법령에 따라 보존하는 개인정보는 다른 정보와 구분하여 관리하고 보존 기간이 끝나면 파기합니다.",
    ],
  },
  {
    title: "9. 이용자의 권리 및 행사 방법",
    items: [
      "이용자는 관련 법령에 따라 자신의 개인정보에 대한 열람, 정정·삭제, 처리정지 및 동의 철회 등을 요청할 수 있습니다.",
      "개인정보에 관한 요청은 운영자 이메일로 접수하며, 필요한 본인 확인 후 관련 법령에서 정한 절차에 따라 처리합니다.",
      "법정대리인은 관련 법령에서 정한 방법에 따라 정보주체의 권리를 행사할 수 있습니다.",
      "서비스 이용에 필수적인 개인정보의 처리를 중단하는 경우 회원 기능 이용이 제한될 수 있습니다.",
    ],
  },
  {
    title: "10. 개인정보의 안전성 확보 조치",
    items: [
      "회원 인증 및 회원별 데이터 접근 권한을 적용합니다.",
      "데이터베이스에는 행 수준 보안(RLS) 정책을 적용하고 파일 저장소에는 접근 권한 정책을 적용합니다.",
      "커뮤니티 관리를 위한 관리자 삭제 권한은 지정된 운영자 계정에 부여합니다.",
      "운영자는 개인정보 접근 권한과 서비스 보안 설정을 관리하고 필요한 보호조치를 점검합니다.",
    ],
  },
  {
    title: "11. 브라우저 저장정보 및 방문자 분석",
    items: [
      "로그인 상태 유지에 필요한 인증정보가 브라우저에 저장될 수 있습니다.",
      "커뮤니티 게시글의 중복 조회를 줄이기 위해 게시글별 최근 조회 시점을 브라우저의 로컬 저장소에 기록합니다.",
      "이용자는 브라우저 설정에서 사이트 데이터와 쿠키 등을 삭제할 수 있습니다. 삭제 시 로그인 상태 유지 등 일부 기능이 제한될 수 있습니다.",
     "서비스 이용 현황 및 개선을 위해 Vercel Web Analytics를 사용합니다.",
"방문자 수, 페이지 조회수, 유입 경로, 이용 기기 및 국가 등의 방문 통계를 분석합니다.",
"Vercel Web Analytics는 방문자 분석에 쿠키를 사용하지 않으며, 통계 조회 가능 기간은 현재 Hobby 요금제 기준 30일입니다.",
"로그인, 회원가입, 마이페이지, 비공개 성장일기 및 비밀번호 재설정 페이지의 분석 이벤트는 전송 대상에서 제외합니다.",
    ],
  },
  {
    title: "12. 개인정보 보호 담당자 및 권리구제",
    items: [
      "운영 형태: 개인 운영",
      "개인정보 보호 담당자 표시명: LIKE TURTLE 운영자",
      "문의 이메일: 3254lee@naver.com",
      "개인정보 문의, 권리 행사 및 회원 탈퇴 신청은 위 이메일을 통해 접수합니다.",
      "개인정보 침해와 관련한 상담은 개인정보침해 신고센터(국번 없이 118, privacy.kisa.or.kr) 또는 개인정보분쟁조정위원회(kopico.go.kr)를 이용할 수 있습니다.",
    ],
  },
  {
    title: "13. 개인정보처리방침 변경",
    items: [
      "개인정보처리방침의 변경 내용과 적용일은 웹사이트를 통해 공개합니다.",
      "관련 법령에 따라 별도의 고지 또는 동의가 필요한 경우 해당 절차를 진행합니다.",
      "문서 버전: 2026-11-25",
    ],
  },
];

export default function PrivacyPage() {
  const mailto =
    `mailto:${email}?subject=` +
    encodeURIComponent("LIKE TURTLE 개인정보 및 회원 탈퇴 문의");

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
            <ShieldCheck size={23} />
            <span className="text-xs font-bold tracking-widest">
              PRIVACY POLICY
            </span>
          </div>

          <h1 className="font-hand mt-5 text-3xl font-bold sm:text-4xl">
            개인정보처리방침
          </h1>

          <p className="mt-4 break-keep text-sm leading-7 text-[#718573]">
            회원의 개인정보를 안전하게 보호하고,
            이용자의 권리를 존중합니다.
          </p>

          <p className="mt-3 text-xs text-[#829482]">
            문서 버전: {policyVersion}
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-[#dce7d8] bg-[#f5f9f2] px-5 py-4 text-xs leading-6 text-[#718573]">
          외부 서비스의 개인정보 처리위탁 및 국외 이전
          세부사항과 기술적 정보의 보유 기간은
          현재 확인 중입니다.
        </div>

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

        <div className="mt-6 rounded-2xl border border-[#e3e9df] bg-white p-5">
          <h2 className="text-sm font-bold">
            외부 서비스 개인정보 관련 안내
          </h2>

          <div className="mt-3 flex flex-col gap-3 text-xs font-semibold text-[#668b6c]">
            <a
              href="https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Supabase 데이터 저장 및 이전 안내
            </a>

            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Vercel 개인정보 보호정책
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={mailto}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white hover:bg-[#527558]"
          >
            <Mail size={17} />
            개인정보 및 회원 탈퇴 문의
          </a>

          <Link
            href="/terms"
            className="text-xs font-semibold text-[#668b6c] hover:underline"
          >
            이용약관 보기
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
