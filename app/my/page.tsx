
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
    const comments = (commentsResult.data ?? []) as Comment[];

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
            postList.map((item) => [item.id, item.title])
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

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
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

    setSaving(false);
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
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      <section className="mt-7 rounded-[28px] bg-[#eaf2e4] px-7 py-11 md:px-12">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle size={24} />
          <span className="text-xs font-bold tracking-widest">
            MY TORTOISE
          </span>
        </div>

        <h1 className="font-hand mt-5 text-4xl md:text-5xl">
          나의 거북이 공간
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#718573]">
          조금 느리면 어때.
          <br />
          내가 남긴 이야기와 소중한 기록을 모아보세요.
        </p>
      </section>

      {loading ? (
        <div className="mt-8 rounded-3xl bg-white p-12 text-center text-sm">
          회원 정보를 불러오는 중입니다...
        </div>
      ) : !user ? (
        <section className="mt-8 rounded-3xl border border-[#e3e9df] bg-white p-10 text-center">
          <LogIn
            size={35}
            className="mx-auto text-[#719273]"
          />

          <h2 className="font-hand mt-5 text-2xl">
            로그인이 필요해요
          </h2>

          <p className="mt-3 text-sm text-[#829482]">
            마이페이지는 로그인한 회원만 이용할 수 있습니다.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
          >
            로그인하기
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-3xl border border-[#e3e9df] bg-white p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2e4] text-[#668b6c]">
                  <UserRound size={30} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#91a291]">
                    거북이처럼 회원
                  </p>

                  <h2 className="font-hand mt-1 break-words text-2xl">
                    {nicknameOf(user)}
                  </h2>

                  <p className="mt-1 break-all text-xs text-[#91a291]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-[#edf0e9] pt-5 text-xs text-[#829482]">
                <CalendarDays size={15} />
                가입일 {formatDate(user.created_at)}
              </div>
            </div>

            <form
              onSubmit={saveProfile}
              className="rounded-3xl border border-[#e3e9df] bg-white p-7"
            >
              <div className="flex items-center gap-2">
                <Pencil
                  size={19}
                  className="text-[#719273]"
                />
                <h2 className="font-hand text-2xl">
                  프로필 설정
                </h2>
              </div>

              <label
                htmlFor="nickname"
                className="mt-6 block text-sm font-bold"
              >
                닉네임
              </label>

              <input
                id="nickname"
                value={nickname}
                onChange={(event) =>
                  setNickname(event.target.value)
                }
                maxLength={20}
                minLength={2}
                required
                className="mt-2 w-full rounded-xl border border-[#dce7d8] px-4 py-3 text-sm outline-none focus:border-[#668b6c]"
              />

              <p className="mt-2 text-xs text-[#91a291]">
                2~20자 · 로그인 계정의 프로필에 저장됩니다.
              </p>

              {message && (
                <p
                  role="status"
                  className="mt-4 text-sm text-[#64866a]"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "저장 중..." : "프로필 저장"}
              </button>
            </form>
          </section>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <section className="mt-8 grid grid-cols-3 gap-3">
            {tabs.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`rounded-2xl border p-4 text-center transition ${
                    tab === item.id
                      ? "border-[#668b6c] bg-[#edf5e8]"
                      : "border-[#e3e9df] bg-white"
                  }`}
                >
                  <Icon
                    size={21}
                    className="mx-auto text-[#719273]"
                  />

                  <p className="mt-3 text-xl font-bold">
                    {item.count}
                  </p>

                  <p className="mt-1 text-xs text-[#829482]">
                    {item.label}
                  </p>
                </button>
              );
            })}
          </section>

          <section className="mt-8 overflow-hidden rounded-3xl border border-[#e3e9df] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] p-6">
              <h2 className="font-hand text-2xl">
                {tabs.find((item) => item.id === tab)?.label}
              </h2>

              <Link
                href="/community"
                className="text-xs font-bold text-[#668b6c]"
              >
                커뮤니티 바로가기
              </Link>
            </div>

            {tab === "comments" ? (
              myComments.length === 0 ? (
                <p className="p-12 text-center text-sm text-[#829482]">
                  아직 작성한 댓글이 없습니다.
                </p>
              ) : (
                <div className="divide-y divide-[#edf0e9]">
                  {myComments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/community/${comment.post_id}`}
                      className="block p-6 hover:bg-[#f8faf6]"
                    >
                      <p className="text-xs text-[#91a291]">
                        {commentPosts[comment.post_id] ??
                          "삭제되었거나 확인할 수 없는 게시글"}
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">
                        {comment.content}
                      </p>

                      <p className="mt-3 text-xs text-[#9aab99]">
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
                    <p className="p-12 text-center text-sm text-[#829482]">
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
                        className="block p-6 transition hover:bg-[#f8faf6]"
                      >
                        <span className="rounded-full bg-[#edf4e9] px-3 py-1 text-xs font-bold text-[#64866a]">
                          {categoryName(post.category)}
                        </span>

                        <h3 className="mt-3 break-words text-base font-bold">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-xs text-[#91a291]">
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
