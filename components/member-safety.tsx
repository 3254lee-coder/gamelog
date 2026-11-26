"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase";

const enabled = process.env.NEXT_PUBLIC_MEMBER_SAFETY === "true";
const Context = createContext({
  userId: "",
  blocked: [] as string[],
  reload: () => {},
});
export const useSafety = () => useContext(Context);
export function SafetyProvider({ children }: { children: ReactNode }) {
  const [userId, setUser] = useState(""),
    [blocked, setBlocked] = useState<string[]>([]),
    [version, refresh] = useState(0);
  useEffect(() => {
    const db = getSupabase();
    if (!enabled || !db) return;
    const { data } = db.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user.id ?? ""),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let active = true;
    setBlocked([]);
    const db = getSupabase();
    if (userId && db)
      void db
        .from("lt_blocks")
        .select("member_id")
        .then(({ data }) => {
          if (active) setBlocked((data ?? []).map((row) => row.member_id));
        });
    return () => {
      active = false;
    };
  }, [userId, version]);
  return (
    <Context.Provider
      value={{ userId, blocked, reload: () => refresh((v) => v + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export function SafetyActions({
  kind,
  id,
  author,
}: {
  kind: "post" | "comment";
  id: string;
  author: string | null;
}) {
  const { userId, reload } = useSafety();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  if (!enabled || !userId || userId === author) return null;
  async function act(action: "member" | "block" | "content") {
    const db = getSupabase();
    if (!db || busy) return;
    const reason =
      action === "block"
        ? ""
        : window.prompt("신고 사유를 입력해 주세요 (최대 500자).")?.trim();
    if (action !== "block" && (!reason || reason.length > 500)) return;
    if (
      action === "block" &&
      !window.confirm("이 회원의 글과 댓글을 숨길까요?")
    )
      return;
    setBusy(true);
    try {
      const { error } =
        action === "block"
          ? await db.from("lt_blocks").insert({ member_id: author })
          : await db
              .from("lt_reports")
              .insert({
                kind: action === "member" ? "member" : kind,
                target: action === "member" ? author : id,
                reason,
              });
      setMessage(
        error
          ? error.code === "23505"
            ? "이미 접수되었습니다."
            : "처리하지 못했습니다. 다시 시도해 주세요."
          : "처리되었습니다.",
      );
      if (!error && action === "block") reload();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3 py-2 text-xs">
      <button disabled={busy} onClick={() => act("content")}>
        신고
      </button>
      {author && (
        <>
          <button disabled={busy} onClick={() => act("member")}>
            회원 신고
          </button>
          <button disabled={busy} onClick={() => act("block")}>
            회원 차단
          </button>
        </>
      )}
      <span role="status">{message}</span>
    </div>
  );
}
export function AccountSafety() {
  const { userId, blocked, reload } = useSafety();
  const [busy, setBusy] = useState(false),
    [msg, setMsg] = useState(""),
    [password, setPassword] = useState("");
  if (!enabled || !userId) return null;
  async function withdraw() {
    const db = getSupabase();
    if (
      !db ||
      !password ||
      busy ||
      !window.confirm("본인 확인 후 운영자에게 탈퇴 처리를 요청할까요?")
    )
      return;
    setBusy(true);
    try {
      const { data } = await db.auth.getUser();
      if (!data.user?.email || data.user.id !== userId) {
        setMsg("다시 로그인해 주세요.");
        return;
      }
      const auth = await db.auth.signInWithPassword({
        email: data.user.email,
        password,
      });
      if (auth.error || auth.data.user?.id !== userId) {
        setMsg("비밀번호를 확인해 주세요.");
        return;
      }
      const { error } = await db
        .from("lt_withdrawals")
        .insert({ owner_id: userId });
      setMsg(
        error && error.code !== "23505"
          ? "요청하지 못했습니다. 다시 시도해 주세요."
          : "탈퇴 요청이 접수되었습니다. 운영자가 확인 후 처리합니다.",
      );
    } finally {
      setPassword("");
      setBusy(false);
    }
  }
  return (
    <section className="my-6 rounded-2xl bg-white p-5">
      <h2>계정 관리</h2>
      {blocked.map((id) => (
        <button
          key={id}
          className="block p-2"
          disabled={busy}
          onClick={async () => {
            const db = getSupabase();
            if (!db) return;
            setBusy(true);
            try {
              const { error } = await db
                .from("lt_blocks")
                .delete()
                .eq("member_id", id);
              if (error) setMsg("차단 해제에 실패했습니다.");
              else reload();
            } finally {
              setBusy(false);
            }
          }}
        >
          회원 {id.slice(0, 8)} 차단 해제
        </button>
      ))}
      <label className="block">
        탈퇴 요청 본인 확인
        <input
          className="m-2 border"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button disabled={busy || !password} onClick={withdraw}>
        탈퇴 요청
      </button>
      <p role="status">{msg}</p>
    </section>
  );
}
export function ReportQueue() {
  const [rows, setRows] = useState<
      {
        id: string;
        kind: string;
        target: string;
        reason: string;
        status: string;
      }[]
    >([]),
    [msg, setMsg] = useState(""),
    [page, setPage] = useState(0),
    [version, setVersion] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const db = getSupabase();
    if (enabled && db)
      void db
        .from("lt_reports")
        .select("id,kind,target,reason,status,created_at")
        .order("created_at", { ascending: false })
        .order("id")
        .range(page * 25, page * 25 + 24)
        .then(({ data, error }) => {
          if (active) {
            setRows(data ?? []);
            setMsg(error ? "조회에 실패했습니다." : "");
          }
        });
    return () => {
      active = false;
    };
  }, [page, version]);
  if (!enabled) return null;
  return (
    <section className="mt-6 rounded-2xl bg-white p-5">
      <h2>신고 관리</h2>
      {rows.map((row) => (
        <details key={row.id} className="my-3">
          <summary>
            {row.kind} · {row.status}
          </summary>
          <p className="break-all">대상 {row.target}</p>
          <p>{row.reason}</p>
          {["resolved", "dismissed", "pending"].map((v, i) => (
            <button
              className="mr-3"
              key={v}
              disabled={busy || v === row.status}
              onClick={async () => {
                const db = getSupabase();
                if (!db) return;
                setBusy(true);
                try {
                  const { data, error } = await db
                    .from("lt_reports")
                    .update({ status: v })
                    .eq("id", row.id)
                    .eq("status", row.status)
                    .select("id");
                  if (error || !data?.length)
                    setMsg("상태가 변경되었거나 처리할 수 없습니다.");
                  else setVersion((n) => n + 1);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {["처리 완료", "기각", "접수"][i]}
            </button>
          ))}
        </details>
      ))}
      <button disabled={!page} onClick={() => setPage((n) => n - 1)}>
        이전
      </button>{" "}
      ·{" "}
      <button disabled={rows.length < 25} onClick={() => setPage((n) => n + 1)}>
        다음
      </button>
      <p role="status">{msg}</p>
    </section>
  );
}
