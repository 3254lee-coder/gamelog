
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  MessageCircle,
  CornerDownRight,
  X,
} from "lucide-react";

import { getSupabase } from "@/lib/supabase";
import { useSafety } from "@/components/member-safety";

type Notification = {
  id: string;
  post_id: string;
  comment_id: string;
  kind: "comment" | "reply";
  post_title: string;
  created_at: string;
  read_at: string | null;
};

const TABLE = "tortoise_notifications";

function formatTime(value: string) {
  const minutes = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(value).getTime()) / 60000
    )
  );

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) {
    return `${Math.floor(minutes / 60)}시간 전`;
  }

  if (minutes < 10080) {
    return `${Math.floor(minutes / 1440)}일 전`;
  }

  return new Date(value).toLocaleDateString("ko-KR");
}

export default function Notifications({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();
  const { blocked } = useSafety();
  const pathname = usePathname();

  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const db = getSupabase();

    if (!db) return;

    const validBlocked = blocked.filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );
    const blockedFilter = `(${validBlocked.join(",")})`;
    const relation = "comment:tortoise_comments!tortoise_notifications_comment_id_fkey!inner(author_id)";
    let listQuery = db
      .from(TABLE)
      .select(`id, post_id, comment_id, kind, post_title, created_at, read_at, ${relation}`)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    let countQuery = db
      .from(TABLE)
      .select(`id, ${relation}`, { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null);
    if (validBlocked.length) {
      listQuery = listQuery.not("comment.author_id", "in", blockedFilter);
      countQuery = countQuery.not("comment.author_id", "in", blockedFilter);
    }
    const [list, count] = await Promise.all([listQuery, countQuery]);

    if (list.error || count.error) {
      setError("알림을 불러오지 못했습니다.");
    } else {
      setItems((list.data ?? []) as Notification[]);
      setUnread(count.count ?? 0);
      setError("");
    }

    setLoading(false);
  }, [userId, blocked]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 30000);

    function refresh() {
      if (document.visibilityState === "visible") {
        void load();
      }
    }

    window.addEventListener("focus", refresh);

    document.addEventListener(
      "visibilitychange",
      refresh
    );

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);

      document.removeEventListener(
        "visibilitychange",
        refresh
      );
    };
  }, [load]);

  useEffect(() => {
    setOpen(false);
    void load();
  }, [pathname, load]);

  useEffect(() => {
    if (!open) return;

    function outside(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  async function markAllRead() {
    const db = getSupabase();

    if (!db || busy) return;

    setBusy(true);
    setError("");

    try {
      const { error: updateError } = await db
        .from(TABLE)
        .update({
          read_at: new Date().toISOString(),
        })
        .eq("recipient_id", userId)
        .is("read_at", null);

      if (updateError) throw updateError;

      await load();
    } catch {
      setError("읽음 처리에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function openNotification(item: Notification) {
    const db = getSupabase();

    if (!db || busy) return;

    setBusy(true);
    setError("");

    try {
      if (!item.read_at) {
        const { error: updateError } = await db
          .from(TABLE)
          .update({
            read_at: new Date().toISOString(),
          })
          .eq("id", item.id)
          .eq("recipient_id", userId);

        if (updateError) throw updateError;
      }

      await load();

      setOpen(false);

      router.push(
        `/community/${item.post_id}#comment-${item.comment_id}`
      );

      window.setTimeout(() => {
        document
          .getElementById(`comment-${item.comment_id}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 300);
    } catch {
      setError("알림 처리에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={`알림 ${unread}개`}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          void load();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#668b6c] transition hover:bg-[#edf5e8]"
      >
        <Bell size={21} strokeWidth={1.8} />

        {unread > 0 && (
          <span className="absolute right-0 top-0 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#fffefa] bg-[#d97f87] px-1 text-[9px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <section
          aria-label="회원 알림"
          className="fixed left-3 right-3 top-[72px] z-[110] overflow-hidden rounded-2xl border border-[#e3e9df] bg-white text-[#405a46] shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[340px]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#edf0e9] px-4 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Bell size={18} />
              알림
            </h2>

            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#668b6c] disabled:opacity-50"
                >
                  <CheckCheck size={15} />
                  모두 읽음
                </button>
              )}

              <button
                type="button"
                aria-label="알림 닫기"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#829482] hover:bg-[#edf5e8]"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="px-4 py-3 text-xs text-red-500"
            >
              {error}
            </p>
          )}

          <div className="max-h-[55vh] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-10 text-center text-xs text-[#829482]">
                알림을 불러오는 중...
              </p>
            ) : items.length === 0 ? (
              <div className="px-4 py-12 text-center text-[#829482]">
                <BellOff
                  size={30}
                  className="mx-auto"
                />

                <p className="mt-3 text-sm">
                  아직 새로운 알림이 없어요.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    openNotification(item)
                  }
                  className={`flex w-full items-start gap-3 border-b border-[#edf0e9] px-4 py-4 text-left transition hover:bg-[#f5f9f2] ${
                    item.read_at
                      ? "bg-white"
                      : "bg-[#edf5e8]"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#668b6c]">
                    {item.kind === "reply" ? (
                      <CornerDownRight size={18} />
                    ) : (
                      <MessageCircle size={18} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold leading-5">
                      {item.kind === "reply"
                        ? "내 댓글에 새로운 답글이 달렸어요."
                        : "내 게시글에 새로운 댓글이 달렸어요."}
                    </span>

                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#718573]">
                      {item.post_title}
                    </span>

                    <span className="mt-2 block text-[10px] text-[#829482]">
                      {formatTime(item.created_at)}
                    </span>
                  </span>

                  {!item.read_at && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#668b6c]" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-3 text-center">
            <Link
              href="/community"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#668b6c]"
            >
              커뮤니티 둘러보기
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
