
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Users,
  UserPlus,
  FileText,
  MessageCircle,
  CornerDownRight,
  Heart,
  Turtle,
  NotebookPen,
  Pin,
  ChartNoAxesColumn,
  ExternalLink,
  CalendarDays,
} from "lucide-react";

import { getSupabase } from "@/lib/supabase";

const ADMIN_UID =
  "5226f8c2-84ca-4189-b2a1-3a569bd3205c";

type Member = {
  nickname: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type Post = {
  id: string;
  title: string;
  category: string;
  view_count: number;
  created_at: string;
};

type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string;
  content: string;
  post_title: string;
  created_at: string;
};

type Notice = {
  id: string;
  title: string;
  pinned_at: string;
};

type Activity = {
  date: string;
  members: number;
  posts: number;
  comments: number;
};

type Dashboard = {
  members: number;
  members_today: number;
  members_week: number;
  posts: number;
  comments: number;
  replies: number;
  likes: number;
  turtles: number;
  growth_records: number;
  notices: number;

  recent_members: Member[];
  recent_posts: Post[];
  recent_comments: Comment[];
  pinned_posts: Notice[];
  daily_activity: Activity[];
};

type Tab =
  | "overview"
  | "members"
  | "posts"
  | "comments"
  | "notices";

const tabs: {
  id: Tab;
  label: string;
}[] = [
  { id: "overview", label: "전체 현황" },
  { id: "members", label: "회원" },
  { id: "posts", label: "게시글" },
  { id: "comments", label: "댓글" },
  { id: "notices", label: "공지사항" },
];

const categoryNames: Record<string, string> = {
  free: "자유게시판",
  tips: "정보·TIP",
  question: "질문",
};

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

function formatDate(value: string | null) {
  if (!value) return "기록 없음";

  return new Date(value).toLocaleString(
    "ko-KR",
    {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

const panel =
  "rounded-[22px] border border-[#e3e9df] bg-white p-4 sm:p-6";

export default function AdminPage() {
  const [data, setData] =
    useState<Dashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [updatedAt, setUpdatedAt] = useState("");

  const loadDashboard = useCallback(async () => {
    const db = getSupabase();

    setLoading(true);
    setData(null);
    setError("");
    setDenied(false);

    try {
      if (!db) {
        throw new Error("Supabase 연결을 확인해 주세요.");
      }

      const {
        data: auth,
        error: authError,
      } = await db.auth.getUser();

      if (
        authError ||
        auth.user?.id !== ADMIN_UID
      ) {
        setDenied(true);
        return;
      }

      const result = await db.rpc(
        "get_tortoise_admin_dashboard"
      );

      if (result.error) {
        if (result.error.code === "42501") {
          setDenied(true);
          return;
        }

        throw result.error;
      }

      const {
        data: verified,
      } = await db.auth.getUser();

      if (verified.user?.id !== ADMIN_UID) {
        setDenied(true);
        return;
      }

      setData(result.data as Dashboard);

      setUpdatedAt(
        new Date().toISOString()
      );

    } catch (caught) {
      console.error("관리자 통계 조회 실패", caught);

      setError(
        "관리자 정보를 불러오지 못했습니다. SQL 설정을 확인해 주세요."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const db = getSupabase();

    void loadDashboard();

    if (!db) return;

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user.id !== ADMIN_UID) {
          setData(null);
          setDenied(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadDashboard]);

  if (denied) {
    return (
      <main className="container-site min-h-[65vh] px-4 py-16 text-center text-[#405a46]">
        <ShieldAlert
          size={48}
          className="mx-auto text-[#b58a78]"
        />

        <h1 className="font-hand mt-5 text-3xl">
          접근 권한이 없습니다
        </h1>

        <p className="mt-4 text-sm text-[#829482]">
          관리자 계정으로만 이용할 수 있습니다.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white"
        >
          홈으로 돌아가기
        </Link>
      </main>
    );
  }

  const cards = data
    ? [
        {
          label: "전체 회원",
          value: data.members,
          icon: Users,
        },
        {
          label: "오늘 가입",
          value: data.members_today,
          icon: UserPlus,
        },
        {
          label: "최근 7일 가입",
          value: data.members_week,
          icon: CalendarDays,
        },
        {
          label: "전체 게시글",
          value: data.posts,
          icon: FileText,
        },
        {
          label: "전체 댓글·답글",
          value: data.comments,
          icon: MessageCircle,
        },
        {
          label: "대댓글",
          value: data.replies,
          icon: CornerDownRight,
        },
        {
          label: "전체 좋아요",
          value: data.likes,
          icon: Heart,
        },
        {
          label: "등록 거북이",
          value: data.turtles,
          icon: Turtle,
        },
        {
          label: "성장 기록",
          value: data.growth_records,
          icon: NotebookPen,
        },
        {
          label: "고정 공지글",
          value: data.notices,
          icon: Pin,
        },
      ]
    : [];

  const maxActivity = Math.max(
    1,
    ...(data?.daily_activity ?? []).flatMap(
      (item) => [
        item.members,
        item.posts,
        item.comments,
      ]
    )
  );

  function renderMembers() {
    if (!data) return null;

    return (
      <section className={panel}>
        <h2 className="flex items-center gap-2 font-bold">
          <Users size={19} />
          최근 가입 회원
        </h2>

        <p className="mt-2 text-xs text-[#829482]">
          최근 가입자 최대 50명을 표시합니다.
        </p>

        <div className="mt-4 divide-y divide-[#edf0e9]">
          {data.recent_members.length === 0 && (
            <p className="py-7 text-center text-sm text-[#829482]">
              등록된 회원이 없습니다.
            </p>
          )}

          {data.recent_members.map(
            (member, index) => (
              <div
                key={`${member.created_at}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <p className="break-all text-sm font-bold">
                    {member.nickname}
                  </p>

                  <p className="mt-1 text-[11px] text-[#829482]">
                    가입: {formatDate(member.created_at)}
                  </p>
                </div>

                <div className="text-right text-[11px] text-[#829482]">
                  <p>최근 로그인</p>
                  <p className="mt-1">
                    {formatDate(member.last_sign_in_at)}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    );
  }

  function renderPosts() {
    if (!data) return null;

    return (
      <section className={panel}>
        <h2 className="flex items-center gap-2 font-bold">
          <FileText size={19} />
          최근 게시글
        </h2>

        <p className="mt-2 text-xs text-[#829482]">
          게시글을 선택하면 기존 관리자 기능을 이용할 수 있습니다.
        </p>

        <div className="mt-4 divide-y divide-[#edf0e9]">
          {data.recent_posts.length === 0 && (
            <p className="py-7 text-center text-sm text-[#829482]">
              작성된 게시글이 없습니다.
            </p>
          )}

          {data.recent_posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="flex items-center gap-3 py-4 transition hover:bg-[#f5f9f2]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#edf5e8] px-2 py-1 text-[10px] font-bold text-[#668b6c]">
                    {categoryNames[post.category] ??
                      post.category}
                  </span>

                  <span className="text-[10px] text-[#829482]">
                    조회 {formatNumber(post.view_count)}
                  </span>
                </div>

                <p className="mt-2 break-words text-sm font-bold">
                  {post.title}
                </p>

                <p className="mt-1 text-[11px] text-[#829482]">
                  {formatDate(post.created_at)}
                </p>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-[#668b6c]"
              />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderComments() {
    if (!data) return null;

    return (
      <section className={panel}>
        <h2 className="flex items-center gap-2 font-bold">
          <MessageCircle size={19} />
          최근 댓글 및 대댓글
        </h2>

        <div className="mt-4 divide-y divide-[#edf0e9]">
          {data.recent_comments.length === 0 && (
            <p className="py-7 text-center text-sm text-[#829482]">
              작성된 댓글이 없습니다.
            </p>
          )}

          {data.recent_comments.map((comment) => (
            <Link
              key={comment.id}
              href={`/community/${comment.post_id}#comment-${comment.id}`}
              className="block py-4 transition hover:bg-[#f5f9f2]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#edf5e8] px-2 py-1 text-[10px] font-bold text-[#668b6c]">
                  {comment.parent_id
                    ? "대댓글"
                    : "댓글"}
                </span>

                <span className="text-xs font-bold">
                  {comment.nickname}
                </span>

                <span className="text-[10px] text-[#829482]">
                  {formatDate(comment.created_at)}
                </span>
              </div>

              <p className="mt-2 break-words text-sm leading-6">
                {comment.content}
              </p>

              <p className="mt-2 text-xs text-[#829482]">
                게시글: {comment.post_title}
              </p>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderNotices() {
    if (!data) return null;

    return (
      <section className={panel}>
        <h2 className="flex items-center gap-2 font-bold">
          <Pin size={19} />
          현재 고정된 공지사항
        </h2>

        <div className="mt-4 space-y-3">
          {data.pinned_posts.length === 0 && (
            <p className="py-7 text-center text-sm text-[#829482]">
              고정된 공지사항이 없습니다.
            </p>
          )}

          {data.pinned_posts.map((notice) => (
            <Link
              key={notice.id}
              href={`/community/${notice.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[#edf5e8] p-4 transition hover:bg-[#e4efdf]"
            >
              <Pin
                size={18}
                className="shrink-0 text-[#668b6c]"
              />

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold">
                  {notice.title}
                </p>

                <p className="mt-2 text-[11px] text-[#829482]">
                  고정: {formatDate(notice.pinned_at)}
                </p>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-[#668b6c]"
              />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="container-site min-h-screen min-w-0 pb-32 pt-6 text-[#405a46] sm:pt-10 md:pb-24">
      <Link
        href="/"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#668b6c]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      <header className="mt-4 rounded-[24px] bg-[#eaf2e4] p-5 sm:p-9">
        <div className="flex items-center gap-2 text-[#668b6c]">
          <ShieldCheck size={24} />

          <span className="text-xs font-bold tracking-widest">
            LIKE TURTLE ADMIN
          </span>
        </div>

        <h1 className="font-hand mt-4 text-3xl font-bold sm:text-4xl">
          관리자 대시보드
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#718573]">
          거북이처럼의 회원과 커뮤니티 운영 현황을 확인합니다.
        </p>
      </header>

      {loading ? (
        <div className="mt-6 rounded-2xl bg-white p-12 text-center text-sm text-[#829482]">
          <RefreshCw
            size={24}
            className="mx-auto mb-4 animate-spin"
          />
          운영 현황을 불러오는 중입니다.
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600"
        >
          {error}

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 block rounded-xl bg-white px-4 py-3 font-bold"
          >
            다시 시도
          </button>
        </div>
      ) : data && (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#829482]">
              최근 갱신: {formatDate(updatedAt)}
            </span>

            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dce7d8] bg-white px-4 text-xs font-bold text-[#668b6c]"
            >
              <RefreshCw size={15} />
              새로고침
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`min-h-10 rounded-full border px-4 text-xs font-bold transition ${
                  tab === item.id
                    ? "border-[#668b6c] bg-[#668b6c] text-white"
                    : "border-[#dce7d8] bg-white text-[#718573]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                {cards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="min-w-0 rounded-2xl border border-[#e3e9df] bg-white p-4 sm:p-5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5e8] text-[#668b6c]">
                        <Icon size={21} />
                      </span>

                      <p className="mt-3 text-xs font-bold text-[#829482]">
                        {item.label}
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold tabular-nums sm:text-3xl">
                        {formatNumber(item.value)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <section className={panel}>
                <h2 className="flex items-center gap-2 font-bold">
                  <ChartNoAxesColumn size={20} />
                  최근 7일 활동 현황
                </h2>

                <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-[#718573]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#668b6c]" />
                    신규 회원
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#b5cba8]" />
                    게시글
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#d7bda0]" />
                    댓글
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-1 sm:gap-4">
                  {data.daily_activity.map((day) => (
                    <div
                      key={day.date}
                      className="min-w-0"
                    >
                      <div className="flex h-36 items-end justify-center gap-0.5 border-b border-[#e3e9df] sm:h-44 sm:gap-1.5">
                        {[
                          {
                            value: day.members,
                            color: "#668b6c",
                            label: "신규 회원",
                          },
                          {
                            value: day.posts,
                            color: "#b5cba8",
                            label: "게시글",
                          },
                          {
                            value: day.comments,
                            color: "#d7bda0",
                            label: "댓글",
                          },
                        ].map((bar) => (
                          <div
                            key={bar.label}
                            title={`${day.date} ${bar.label}: ${bar.value}`}
                            className="relative w-[28%] max-w-8 rounded-t-sm"
                            style={{
                              height: `${bar.value / maxActivity * 85}%`,
                              minHeight: bar.value > 0 ? 3 : 0,
                              backgroundColor: bar.color,
                            }}
                          >
                            {bar.value > 0 && (
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#718573]">
                                {bar.value}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="mt-2 text-center text-[10px] text-[#829482]">
                        {day.date.slice(5).replace("-", "/")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={panel}>
                <h2 className="font-bold">
                  운영 도구
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/community"
                    className="flex items-center gap-3 rounded-2xl bg-[#edf5e8] p-4 text-sm font-bold"
                  >
                    <MessageCircle size={20} />

                    <span className="flex-1">
                      커뮤니티 관리
                    </span>

                    <ArrowRight size={17} />
                  </Link>

                  <a
                    href="https://vercel.com/gamelog3/like-turtle/analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl bg-[#edf5e8] p-4 text-sm font-bold"
                  >
                    <ChartNoAxesColumn size={20} />

                    <span className="flex-1">
                      방문자 통계
                    </span>

                    <ExternalLink size={16} />
                  </a>
                </div>
              </section>

              {renderPosts()}
              {renderNotices()}
            </div>
          )}

          {tab !== "overview" && (
            <div className="mt-6">
              {tab === "members" && renderMembers()}
              {tab === "posts" && renderPosts()}
              {tab === "comments" && renderComments()}
              {tab === "notices" && renderNotices()}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-[#829482]">
            LIKE TURTLE · 관리자 전용
          </p>
        </>
      )}
    </main>
  );
}
