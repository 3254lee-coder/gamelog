
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CalendarDays,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  Turtle,
} from "lucide-react";

type Post = {
  id: string;
  author_id: string;
  category: "free" | "tips" | "question";
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Comment = {
  id: string;
  post_id: string;
  author_id: string | null;
  nickname: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const categoryNames = {
  free: "자유게시판",
  tips: "정보 및 TIP 공유하기",
  question: "질문",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNickname(user: User) {
  const metadata = user.user_metadata;

  const name =
    metadata?.nickname ||
    metadata?.display_name ||
    metadata?.name ||
    user.email?.split("@")[0] ||
    "회원";

  return String(name).trim().slice(0, 20) || "회원";
}

export default function CommunityPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const supabase = getSupabase();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [saving, setSaving] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!supabase || !postId) {
      setError("Supabase 연결 설정을 확인해 주세요.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadData() {
      setLoading(true);

      const [postResult, commentResult, authResult] =
        await Promise.all([
          supabase!
            .from("tortoise_posts")
            .select(
              "id, author_id, category, title, content, created_at, updated_at"
            )
            .eq("id", postId)
            .maybeSingle(),

          supabase!
            .from("tortoise_comments")
            .select(
              "id, post_id, author_id, nickname, content, created_at, updated_at"
            )
            .eq("post_id", postId)
            .order("created_at", { ascending: true }),

          supabase!.auth.getUser(),
        ]);

      if (!active) return;

      if (postResult.error) {
        setError("게시글을 불러오지 못했습니다.");
      } else if (!postResult.data) {
        setError("존재하지 않거나 삭제된 게시글입니다.");
      } else {
        setPost(postResult.data as Post);
      }

      if (commentResult.error) {
        setCommentError("댓글을 불러오지 못했습니다.");
      } else {
        setComments((commentResult.data ?? []) as Comment[]);
      }

      setUser(authResult.data.user ?? null);
      setLoading(false);
    }

    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [postId, supabase]);

  async function refreshComments() {
    if (!supabase) return;

    const { data, error: fetchError } = await supabase
      .from("tortoise_comments")
      .select(
        "id, post_id, author_id, nickname, content, created_at, updated_at"
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setCommentError("댓글 목록을 새로고침하지 못했습니다.");
      return;
    }

    setComments((data ?? []) as Comment[]);
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommentError("");

    if (!supabase) return;

    const text = commentText.trim();

    if (!text || text.length > 2000) {
      setCommentError("댓글은 1~2,000자로 입력해 주세요.");
      return;
    }

    setSaving(true);

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setSaving(false);
      setUser(null);
      setCommentError("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    const currentUser = authData.user;

    const { error: insertError } = await supabase
      .from("tortoise_comments")
      .insert({
        post_id: postId,
        author_id: currentUser.id,
        nickname: getNickname(currentUser),
        content: text,
      });

    setSaving(false);

    if (insertError) {
      setCommentError(
        "댓글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
      return;
    }

    setCommentText("");
    await refreshComments();
  }

  async function saveEdit(comment: Comment) {
    if (!supabase || !user || comment.author_id !== user.id) return;

    const text = editingText.trim();

    if (!text || text.length > 2000) {
      setCommentError("댓글은 1~2,000자로 입력해 주세요.");
      return;
    }

    setSaving(true);
    setCommentError("");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user || authData.user.id !== comment.author_id) {
      setSaving(false);
      setCommentError("댓글 수정 권한을 확인할 수 없습니다.");
      return;
    }

    const { error: updateError } = await supabase
      .from("tortoise_comments")
      .update({
        content: text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", comment.id)
      .eq("author_id", authData.user.id);

    setSaving(false);

    if (updateError) {
      setCommentError("댓글 수정에 실패했습니다.");
      return;
    }

    setEditingId(null);
    setEditingText("");
    await refreshComments();
  }

  async function deleteComment(comment: Comment) {
    if (!supabase || !user || comment.author_id !== user.id) return;

    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;

    setSaving(true);
    setCommentError("");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user || authData.user.id !== comment.author_id) {
      setSaving(false);
      setCommentError("댓글 삭제 권한을 확인할 수 없습니다.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("tortoise_comments")
      .delete()
      .eq("id", comment.id)
      .eq("author_id", authData.user.id);

    setSaving(false);

    if (deleteError) {
      setCommentError("댓글 삭제에 실패했습니다.");
      return;
    }

    await refreshComments();
  }

  return (
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        커뮤니티로 돌아가기
      </Link>

      {loading ? (
        <div className="mt-8 rounded-[24px] bg-white p-12 text-center">
          게시글을 불러오는 중입니다...
        </div>
      ) : error || !post ? (
        <section className="mt-8 rounded-[24px] bg-white p-12 text-center">
          <Turtle size={42} className="mx-auto text-[#9db69d]" />
          <h1 className="font-hand mt-5 text-3xl">
            게시글을 찾을 수 없어요
          </h1>
          <p className="mt-4 text-sm text-[#819482]">{error}</p>
        </section>
      ) : (
        <>
          <article className="mt-8 overflow-hidden rounded-[24px] border border-[#e3e9df] bg-white shadow-sm">
            <header className="border-b border-[#edf0e9] bg-[#f5f9f2] px-6 py-9 md:px-10">
              <span className="rounded-full bg-[#e4efdf] px-4 py-2 text-xs font-bold text-[#62866a]">
                {categoryNames[post.category]}
              </span>

              <h1 className="font-hand mt-6 break-words text-3xl md:text-4xl">
                {post.title}
              </h1>

              <div className="mt-5 flex items-center gap-2 text-xs text-[#829482]">
                <CalendarDays size={15} />
                {formatDate(post.created_at)}
              </div>
            </header>

            <div className="min-h-[250px] whitespace-pre-wrap break-words px-6 py-10 text-sm leading-8 md:px-10 md:text-base">
              {post.content}
            </div>
          </article>

          <section className="mt-8 rounded-[24px] border border-[#e3e9df] bg-white px-6 py-9 md:px-10">
            <div className="flex items-center gap-2">
              <MessageCircle size={23} className="text-[#719273]" />
              <h2 className="font-hand text-2xl">
                댓글 {comments.length}
              </h2>
            </div>

            {commentError && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {commentError}
              </p>
            )}

            <div className="mt-7 divide-y divide-[#edf0e9]">
              {comments.length === 0 ? (
                <div className="rounded-2xl bg-[#f7faf5] px-5 py-10 text-center text-sm text-[#819482]">
                  아직 댓글이 없어요. 첫 댓글을 남겨주세요!
                </div>
              ) : (
                comments.map((comment) => {
                  const isOwner =
                    !!user && comment.author_id === user.id;

                  return (
                    <div key={comment.id} className="py-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-sm font-bold">
                            {comment.nickname}
                          </span>
                          <span className="ml-3 text-xs text-[#9baa99]">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>

                        {isOwner && (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setEditingId(comment.id);
                                setEditingText(comment.content);
                              }}
                              className="inline-flex items-center gap-1 text-xs text-[#668b6c]"
                            >
                              <Pencil size={14} />
                              수정
                            </button>

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => deleteComment(comment)}
                              className="inline-flex items-center gap-1 text-xs text-red-500"
                            >
                              <Trash2 size={14} />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>

                      {editingId === comment.id ? (
                        <div className="mt-4">
                          <textarea
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            maxLength={2000}
                            rows={4}
                            className="w-full rounded-xl border border-[#dce7d8] p-4 text-sm outline-none"
                          />

                          <div className="mt-3 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-full border px-5 py-2 text-xs"
                            >
                              취소
                            </button>

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => saveEdit(comment)}
                              className="rounded-full bg-[#668b6c] px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                            >
                              수정 완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#627663]">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-8 border-t border-[#edf0e9] pt-8">
              {user ? (
                <form onSubmit={submitComment}>
                  <p className="mb-3 text-sm font-bold">
                    댓글 작성
                  </p>

                  <textarea
                    value={commentText}
                    onChange={(event) =>
                      setCommentText(event.target.value)
                    }
                    maxLength={2000}
                    rows={4}
                    placeholder="따뜻한 댓글을 남겨주세요."
                    className="w-full rounded-xl border border-[#dce7d8] p-4 text-sm leading-7 outline-none focus:border-[#8cad8c]"
                    required
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#9baa99]">
                      {commentText.length} / 2,000
                    </span>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                      <Send size={16} />
                      {saving ? "처리 중..." : "댓글 등록"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl bg-[#f1f6ed] px-6 py-8 text-center">
                  <LockKeyhole
                    size={28}
                    className="mx-auto text-[#719273]"
                  />

                  <p className="mt-4 text-sm text-[#718573]">
                    댓글을 작성하려면 로그인이 필요합니다.
                  </p>

                  <Link
                    href="/login"
                    className="mt-5 inline-flex rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white"
                  >
                    로그인하러 가기
                  </Link>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 flex justify-center">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={17} />
              게시글 목록
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
