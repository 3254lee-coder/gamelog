
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {useSafety,SafetyActions} from "@/components/member-safety";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import {
  MessageCircle,
  CornerDownRight,
  Pencil,
  Trash2,
  Send,
  LockKeyhole,
} from "lucide-react";

import { getSupabase } from "@/lib/supabase";

const ADMIN_UID =
  "5226f8c2-84ca-4189-b2a1-3a569bd3205c";

type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string | null;
  nickname: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const FIELDS =
  "id, post_id, parent_id, author_id, nickname, content, created_at, updated_at";

function getNickname(user: User) {
  return String(
    user.user_metadata?.nickname ||
    user.user_metadata?.display_name ||
    user.user_metadata?.name ||
    "회원"
  ).trim().slice(0, 20) || "회원";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(
    "ko-KR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function CommunityComments({
  postId,
  user,
}: {
  postId: string;
  user: User | null;
}) {
  const {blocked}=useSafety();
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [text, setText] = useState("");

  const [replyId, setReplyId] =
    useState<string | null>(null);

  const [replyText, setReplyText] = useState("");

  const [editId, setEditId] =
    useState<string | null>(null);

  const [editText, setEditText] = useState("");

  const isAdmin = user?.id === ADMIN_UID;

  const load = useCallback(async () => {
    const db = getSupabase();

    if (!db) {
      setError("Supabase 연결을 확인해 주세요.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await db
      .from("tortoise_comments")
      .select(FIELDS)
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (fetchError) {
      setError("댓글을 불러오지 못했습니다.");
    } else {
      setComments(
        (data ?? []) as Comment[]
      );
    }

    setLoading(false);
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading) return;

    const hash = window.location.hash;

    if (!hash.startsWith("#comment-")) {
      return;
    }

    const timer = window.setTimeout(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loading, comments.length]);

  useEffect(() => {
    setReplyId(null);
    setReplyText("");
    setEditId(null);
    setEditText("");
    setText("");
  }, [user?.id, postId]);

  async function submit(parentId: string | null) {
    const db = getSupabase();

    if (!db || busy || !user) return;

    const content = (
      parentId ? replyText : text
    ).trim();

    if (!content || content.length > 2000) {
      setError(
        "댓글은 1~2,000자로 입력해 주세요."
      );

      return;
    }

    setBusy(true);
    setError("");

    try {
      const {
        data,
        error: authError,
      } = await db.auth.getUser();

      if (authError || !data.user) {
        throw new Error(
          "로그인 후 작성할 수 있습니다."
        );
      }

      const { error: insertError } = await db
        .from("tortoise_comments")
        .insert({
          post_id: postId,
          parent_id: parentId,
          author_id: data.user.id,
          nickname: getNickname(data.user),
          content,
        });

      if (insertError) {
        throw insertError;
      }

      if (parentId) {
        setReplyId(null);
        setReplyText("");
      } else {
        setText("");
      }

      await load();
    } catch (e) {
      console.error(e);

      setError(
        "댓글 등록에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(comment: Comment) {
    const db = getSupabase();

    if (!db || busy || !user) return;

    const content = editText.trim();

    if (!content || content.length > 2000) {
      setError(
        "댓글은 1~2,000자로 입력해 주세요."
      );

      return;
    }

    setBusy(true);
    setError("");

    try {
      const {
        data,
        error: authError,
      } = await db.auth.getUser();

      if (
        authError ||
        !data.user ||
        data.user.id !== comment.author_id
      ) {
        throw new Error("수정 권한이 없습니다.");
      }

      const {
        data: updated,
        error: updateError,
      } = await db
        .from("tortoise_comments")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", comment.id)
        .eq("post_id", postId)
        .eq("author_id", data.user.id)
        .select("id")
        .single();

      if (updateError || !updated) {
        throw new Error("댓글 수정 실패");
      }

      setEditId(null);
      setEditText("");

      await load();
    } catch (e) {
      console.error(e);

      setError("댓글 수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(comment: Comment) {
    const db = getSupabase();

    if (!db || !user || busy) return;

    const confirmed = window.confirm(
      comment.parent_id
        ? "이 답글을 삭제하시겠습니까?"
        : "이 댓글을 삭제하면 연결된 답글도 삭제됩니다. 계속하시겠습니까?"
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      const {
        data,
        error: authError,
      } = await db.auth.getUser();

      if (
        authError ||
        !data.user ||
        (
          data.user.id !== ADMIN_UID &&
          data.user.id !== comment.author_id
        )
      ) {
        throw new Error("삭제 권한이 없습니다.");
      }

      const {
        data: removed,
        error: deleteError,
      } = await db
        .from("tortoise_comments")
        .delete()
        .eq("id", comment.id)
        .eq("post_id", postId)
        .select("id");

      if (deleteError || !removed?.length) {
        throw new Error("댓글 삭제 실패");
      }

      setEditId(null);
      setReplyId(null);

      await load();
    } catch (e) {
      console.error(e);

      setError("댓글 삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const rootComments = comments.filter(
    (comment) => !comment.parent_id
  );

  function renderComment(
    comment: Comment,
    isReply = false
  ) {
    if(comment.author_id && blocked.includes(comment.author_id)) return null;
    const isOwner =
      !!user &&
      user.id === comment.author_id;

    return (
      <div
        key={comment.id}
        id={`comment-${comment.id}`}
        className={`min-w-0 scroll-mt-28 ${
          isReply
            ? "rounded-2xl bg-[#f3f7ef] px-3 py-4 sm:px-5"
            : "py-5"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isReply && (
                <CornerDownRight
                  size={15}
                  className="text-[#91ab90]"
                />
              )}

              <span className="break-all text-sm font-bold">
                {comment.nickname}
              </span>

              {comment.author_id === ADMIN_UID && (
                <span className="rounded-full bg-[#e4efdf] px-2 py-1 text-[10px] font-bold text-[#405a46]">
                  운영자
                </span>
              )}
            </div>

            <p className="mt-1 text-[10px] text-[#9baa99] sm:text-xs">
              {formatDate(comment.created_at)}
            </p>
          </div>

          <SafetyActions kind="comment" id={comment.id} author={comment.author_id}/>
          {(isOwner || isAdmin) && (
            <div className="flex shrink-0 items-center gap-2">
              {isOwner && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReplyId(null);
                    setEditId(comment.id);
                    setEditText(comment.content);
                  }}
                  className="inline-flex min-h-9 items-center gap-1 text-xs text-[#668b6c]"
                >
                  <Pencil size={13} />
                  수정
                </button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => remove(comment)}
                className="inline-flex min-h-9 items-center gap-1 text-xs text-red-500"
              >
                <Trash2 size={13} />
                {isOwner ? "삭제" : "관리자 삭제"}
              </button>
            </div>
          )}
        </div>

        {editId === comment.id ? (
          <div className="mt-4">
            <textarea
              value={editText}
              onChange={(event) =>
                setEditText(event.target.value)
              }
              maxLength={2000}
              rows={4}
              disabled={busy}
              className="w-full rounded-xl border border-[#dce7d8] bg-white p-3 text-base outline-none sm:text-sm"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditId(null);
                  setEditText("");
                }}
                className="min-h-10 rounded-full border border-[#dce7d8] px-4 text-xs"
              >
                취소
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => saveEdit(comment)}
                className="min-h-10 rounded-full bg-[#668b6c] px-4 text-xs font-bold text-white disabled:opacity-50"
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

        {!isReply && user && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setEditId(null);

              setReplyId(
                replyId === comment.id
                  ? null
                  : comment.id
              );

              setReplyText("");
            }}
            className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-[#668b6c]"
          >
            <CornerDownRight size={15} />
            답글 달기
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="mt-5 min-w-0 rounded-[20px] border border-[#e3e9df] bg-white px-4 py-7 text-[#405a46] sm:mt-8 sm:rounded-[24px] sm:px-6 sm:py-9 md:px-10">
      <div className="flex items-center gap-2">
        <MessageCircle
          size={23}
          className="text-[#719273]"
        />

        <h2 className="font-hand text-2xl">
          댓글 {comments.length}
        </h2>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600"
        >
          {error}
        </p>
      )}

      <div className="mt-5 divide-y divide-[#edf0e9]">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#829482]">
            댓글을 불러오는 중입니다...
          </p>
        ) : rootComments.length === 0 ? (
          <p className="rounded-2xl bg-[#f7faf5] px-4 py-10 text-center text-sm text-[#819482]">
            아직 댓글이 없어요. 첫 댓글을 남겨주세요!
          </p>
        ) : (
          rootComments.map((comment) => {
            const replies = comments.filter(
              (item) =>
                item.parent_id === comment.id
            );

            return (
              <div key={comment.id} className="pb-5">
                {renderComment(comment)}

                {replies.length > 0 && (
                  <div className="ml-3 space-y-2 border-l-2 border-[#dce7d8] pl-3 sm:ml-6 sm:pl-5">
                    {replies.map((reply) =>
                      renderComment(reply, true)
                    )}
                  </div>
                )}

                {replyId === comment.id && (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submit(comment.id);
                    }}
                    className="ml-3 mt-3 rounded-2xl bg-[#f1f6ed] p-3 sm:ml-6 sm:p-4"
                  >
                    <p className="mb-3 flex items-center gap-2 text-xs font-bold text-[#668b6c]">
                      <CornerDownRight size={15} />
                      {comment.nickname}님에게 답글
                    </p>

                    <textarea
                      autoFocus
                      required
                      rows={3}
                      maxLength={2000}
                      value={replyText}
                      disabled={busy}
                      onChange={(event) =>
                        setReplyText(
                          event.target.value
                        )
                      }
                      placeholder="따뜻한 답글을 남겨주세요."
                      className="w-full rounded-xl border border-[#dce7d8] bg-white p-3 text-base leading-6 outline-none sm:text-sm"
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setReplyId(null);
                          setReplyText("");
                        }}
                        className="min-h-10 rounded-full border border-[#dce7d8] bg-white px-4 text-xs"
                      >
                        취소
                      </button>

                      <button
                        type="submit"
                        disabled={
                          busy || !replyText.trim()
                        }
                        className="min-h-10 rounded-full bg-[#668b6c] px-4 text-xs font-bold text-white disabled:opacity-50"
                      >
                        답글 등록
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-7 border-t border-[#edf0e9] pt-7">
        {user ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit(null);
            }}
          >
            <p className="mb-3 text-sm font-bold">
              댓글 작성
            </p>

            <textarea
              required
              rows={4}
              value={text}
              maxLength={2000}
              disabled={busy}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="따뜻한 댓글을 남겨주세요."
              className="w-full rounded-xl border border-[#dce7d8] p-4 text-base leading-7 outline-none sm:text-sm"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-[#9baa99]">
                {text.length} / 2,000
              </span>

              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Send size={16} />

                {busy ? "처리 중..." : "댓글 등록"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl bg-[#f1f6ed] px-4 py-8 text-center">
            <LockKeyhole
              size={28}
              className="mx-auto text-[#719273]"
            />

            <p className="mt-4 text-sm text-[#718573]">
              댓글과 답글을 작성하려면 로그인이 필요합니다.
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
  );
}
