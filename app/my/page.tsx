
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Heart,
  LogIn,
  MessageCircle,
  Pencil,
  Save,
  Turtle,
  UserRound,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Post = {
  id: string;
  author_id: string;
  title: string;
  category: string;
  created_at: string;
};

type Like = {
  post_id: string;
  created_at: string;
};

type Comment = {
  id: string;
  post_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
};

type Tab = "posts" | "likes" | "comments";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

function nicknameOf(user: User) {
  return String(
    user.user_metadata?.nickname ||
      user.user_metadata?.display_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "거북이 회원"
  );
}

function categoryName(value: string) {
  if (value === "free") return "자유게시판";
  if (value === "tips") return "정보 및 TIP";
  if (value === "question") return "질문";
  return "게시글";
}

export default function MyPage() {
  const supabase = useMemo(() => getSupabase(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [nickname, setNickname] = useState("");
  const [tab, setTab] = useState<Tab>("posts");

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myLikes, setMyLikes] = useState<Post[]>([]);
  const [myComments, setMyComments] = useState<Comment[]>([]);
  const [commentPosts, setCommentPosts] = useState<
    Record<string, string>
  >({});

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase 연결 설정이 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    const currentUser = authData.user;

    setUser(currentUser);
    setNickname(nicknameOf(currentUser));

    const [postsResult, likesResult, commentsResult] =
      await Promise.all([
        supabase
          .from("tortoise_posts")
          .select(
            "id, author_id, title, category, created_at"
          )
          .eq("author_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(1000),

        supabase
          .from("tortoise_post_likes")
          .select("post_id, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(1000),

        supabase
          .from("tortoise_comments")
          .select(
            "id, post_id, author_id, content, created_at"
          )
          .eq("author_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);

    if (
      postsResult.error ||
      likesResult.error ||
      commentsResult.error
    ) {
      setError(
        "일부 회원 활동을 불러오지 못했습니다. Supabase 정책을 확인해 주세요."
      );
    }

    setMyPosts((postsResult.data ?? []) as Post[]);

    const likes = (likesResult.data ?? []) as Like[];
    const comments =
      (commentsResult.data ?? []) as Comment[];

    setMyComments(comments);

    const likedIds = likes.map((item) => item.post_id);
    const commentPostIds = comments.map(
      (item) => item.post_id
    );

    const allIds = Array.from(
      new Set([...likedIds, ...commentPostIds])
    );

    if (allIds.length > 0) {
      const { data: relatedPosts, error: relatedError } =
        await supabase
          .from("tortoise_posts")
          .select(
            "id, author_id, title, category, created_at"
          )
          .in("id", allIds);

      if (relatedError) {
        setError(
          "좋아요한 글과 댓글 원문을 불러오지 못했습니다."
        );
        setMyLikes([]);
        setCommentPosts({});
      } else {
        const postList = (relatedPosts ?? []) as Post[];

        const postMap = new Map(
          postList.map((item) => [item.id, item])
        );

        setMyLikes(
          likedIds
            .map((id) => postMap.get(id))
            .filter((item): item is Post => !!item)
        );

        setCommentPosts(
          Object.fromEntries(
            postList.map((item) => [
              item.id,
              item.title,
            ])
          )
        );
      }
    } else {
      setMyLikes([]);
      setCommentPosts({});
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!supabase || !user || saving) return;

    const nextNickname = nickname.trim();

    if (
      nextNickname.length < 2 ||
      nextNickname.length > 20
    ) {
      setMessage("닉네임은 2~20자로 입력해 주세요.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            nickname: nextNickname,
            display_name: nextNickname,
          },
        });

      if (updateError) {
        setMessage(
          "닉네임 변경에 실패했습니다. 다시 시도해 주세요."
        );
      } else if (data.user) {
        setUser(data.user);
        setMessage("닉네임이 변경되었습니다.");
      }
    } catch {
      setMessage(
        "닉네임 변경 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  }

  const tabs: {
    id: Tab;
    label: string;
    count: number;
    icon: typeof BookOpen;
  }[] = [
    {
      id: "posts",
      label: "내 게시글",
      count: myPosts.length,
      icon: BookOpen,
    },
    {
      id: "likes",
      label: "좋아요한 글",
      count: myLikes.length,
      icon: Heart,
    },
    {
      id: "comments",
      label: "내 댓글",
      count: myComments.length,
      icon: MessageCircle,
    },
  ];

  return (
    <main className="container-site min-h-screen min-w-0 pb-28 pt-5 text-[#405a46] sm:pt-9 md:pb-24">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      {/* 마이페이지 소개 */}
      <section className="mt-4 rounded-[22px] bg-[#eaf2e4] px-5 py-8 sm:mt-7 sm:rounded-[28px] sm:px-7 sm:py-11 md:px-12">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle
            size={22}
            className="shrink-0 sm:h-6 sm:w-6"
          />

          <span className="text-[11px] font-bold tracking-[0.14em] sm:text-xs sm:tracking-widest">
            MY TORTOISE
          </span>
        </div>

        <h1 className="font-hand mt-4 break-keep text-[30px] leading-tight sm:mt-5 sm:text-4xl md:text-5xl">
          나의 거북이 공간
        </h1>

        <p className="mt-3 break-keep text-[13px] leading-7 text-[#718573] sm:mt-4 sm:text-sm">
          조금 느리면 어때.
          <br />
          내가 남긴 이야기와 소중한 기록을 모아보세요.
        </p>
      </section>

      {/* 로그인 상태 */}
      {loading ? (
        <div
          role="status"
          className="mt-6 rounded-2xl bg-white px-4 py-12 text-center text-sm text-[#829482] sm:mt-8 sm:rounded-3xl"
        >
          회원 정보를 불러오는 중입니다...
        </div>
      ) : !user ? (
        <section className="mt-6 rounded-[22px] border border-[#e3e9df] bg-white px-5 py-12 text-center sm:mt-8 sm:rounded-3xl sm:p-10">
          <LogIn
            size={35}
            className="mx-auto text-[#719273]"
          />

          <h2 className="font-hand mt-5 text-2xl">
            로그인이 필요해요
          </h2>

          <p className="mt-3 break-keep text-[13px] leading-7 text-[#829482] sm:text-sm">
            마이페이지는 로그인한 회원만 이용할 수 있습니다.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
          >
            로그인하기
          </Link>
        </section>
      ) : (
        <>
          {/* 회원 정보 및 프로필 */}
          <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[1fr_1.4fr]">
            <div className="min-w-0 rounded-[22px] border border-[#e3e9df] bg-white p-5 sm:rounded-3xl sm:p-7">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eaf2e4] text-[#668b6c] sm:h-16 sm:w-16">
                  <UserRound size={29} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#91a291] sm:text-xs">
                    거북이처럼 회원
                  </p>

                  <h2 className="font-hand mt-1 break-words text-[23px] leading-snug sm:text-2xl">
                    {nicknameOf(user)}
                  </h2>

                  <p className="mt-1 break-all text-[11px] leading-5 text-[#91a291] sm:text-xs">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-[#edf0e9] pt-4 text-xs text-[#829482] sm:mt-6 sm:pt-5">
                <CalendarDays size={15} />
                가입일 {formatDate(user.created_at)}
              </div>
            </div>

            <form
              onSubmit={saveProfile}
              className="min-w-0 rounded-[22px] border border-[#e3e9df] bg-white p-5 sm:rounded-3xl sm:p-7"
            >
              <div className="flex items-center gap-2">
                <Pencil
                  size={19}
                  className="text-[#719273]"
                />

                <h2 className="font-hand text-[23px] sm:text-2xl">
                  프로필 설정
                </h2>
              </div>

              <label
                htmlFor="nickname"
                className="mt-5 block text-sm font-bold sm:mt-6"
              >
                닉네임
              </label>

              <input
                id="nickname"
                type="text"
                autoComplete="nickname"
                value={nickname}
                onChange={(event) =>
                  setNickname(event.target.value)
                }
                maxLength={20}
                minLength={2}
                required
                disabled={saving}
                className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-[#dce7d8] bg-white px-4 py-3 text-base outline-none focus:border-[#668b6c] disabled:opacity-60 sm:text-sm"
              />

              <p className="mt-2 text-xs leading-6 text-[#91a291]">
                2~20자 · 로그인 계정의 프로필에 저장됩니다.
              </p>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-4 break-words rounded-xl bg-[#edf5e8] p-3 text-sm leading-6 text-[#64866a]"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 sm:w-auto sm:rounded-full"
              >
                <Save size={16} />
                {saving ? "저장 중..." : "프로필 저장"}
              </button>
            </form>
          </section>

          {error && (
            <p
              role="alert"
              className="mt-6 break-words rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-600"
            >
              {error}
            </p>
          )}

          {/* 회원 활동 탭 */}
          <section
            aria-label="나의 활동"
            className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3"
          >
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={active}
                  className={`flex min-h-[104px] min-w-0 flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition sm:min-h-[120px] sm:p-4 ${
                    active
                      ? "border-[#668b6c] bg-[#edf5e8]"
                      : "border-[#e3e9df] bg-white"
                  }`}
                >
                  <Icon
                    size={20}
                    className="mx-auto text-[#719273] sm:h-[21px] sm:w-[21px]"
                  />

                  <p className="mt-2 text-lg font-bold sm:mt-3 sm:text-xl">
                    {item.count}
                  </p>

                  <p
                    className={`mt-1 break-keep text-[11px] leading-4 sm:text-xs ${
                      active
                        ? "font-bold text-[#64866a]"
                        : "text-[#829482]"
                    }`}
                  >
                    {item.label}
                  </p>
                </button>
              );
            })}
          </section>

          {/* 회원 활동 목록 */}
          <section className="mt-6 min-w-0 overflow-hidden rounded-[22px] border border-[#e3e9df] bg-white sm:mt-8 sm:rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] p-4 sm:p-6">
              <h2 className="font-hand text-[23px] sm:text-2xl">
                {tabs.find((item) => item.id === tab)?.label}
              </h2>

              <Link
                href="/community"
                className="inline-flex min-h-10 items-center text-xs font-bold text-[#668b6c]"
              >
                커뮤니티 바로가기
              </Link>
            </div>

            {tab === "comments" ? (
              myComments.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-[#829482] sm:p-12">
                  아직 작성한 댓글이 없습니다.
                </p>
              ) : (
                <div className="divide-y divide-[#edf0e9]">
                  {myComments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/community/${comment.post_id}`}
                      className="block min-w-0 px-4 py-5 transition hover:bg-[#f8faf6] sm:p-6"
                    >
                      <p className="break-words text-xs leading-5 text-[#91a291]">
                        {commentPosts[comment.post_id] ??
                          "삭제되었거나 확인할 수 없는 게시글"}
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6 text-[#405a46] sm:text-sm sm:leading-7">
                        {comment.content}
                      </p>

                      <p className="mt-3 text-[11px] text-[#9aab99] sm:text-xs">
                        {formatDate(comment.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              (() => {
                const items =
                  tab === "posts" ? myPosts : myLikes;

                if (items.length === 0) {
                  return (
                    <p className="px-4 py-12 text-center text-sm text-[#829482] sm:p-12">
                      {tab === "posts"
                        ? "아직 작성한 게시글이 없습니다."
                        : "아직 좋아요한 게시글이 없습니다."}
                    </p>
                  );
                }

                return (
                  <div className="divide-y divide-[#edf0e9]">
                    {items.map((post) => (
                      <Link
                        key={post.id}
                        href={`/community/${post.id}`}
                        className="block min-w-0 px-4 py-5 transition hover:bg-[#f8faf6] sm:p-6"
                      >
                        <span className="inline-flex max-w-full rounded-full bg-[#edf4e9] px-3 py-1 text-[11px] font-bold text-[#64866a] sm:text-xs">
                          {categoryName(post.category)}
                        </span>

                        <h3 className="mt-3 break-words text-[15px] font-bold leading-6 sm:text-base">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-[11px] text-[#91a291] sm:text-xs">
                          {formatDate(post.created_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                );
              })()
            )}
          </section>
        </>
      )}
    </main>
  );
}
