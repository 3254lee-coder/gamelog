
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesCombined,
  NotebookPen,
  Pencil,
  Plus,
  Save,
  Trash2,
  Turtle,
  X,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Tortoise = {
  id: string;
  user_id: string;
  name: string;
  species: string | null;
  birth_date: string | null;
  adoption_date: string | null;
  photo_path: string | null;
  created_at: string;
};

type GrowthRecord = {
  id: string;
  tortoise_id: string;
  user_id: string;
  measured_on: string;
  weight_g: number | null;
  shell_length_cm: number | null;
  memo: string | null;
  created_at: string;
};

type TortoiseForm = {
  name: string;
  species: string;
  birth_date: string;
  adoption_date: string;
};

type RecordForm = {
  measured_on: string;
  weight_g: string;
  shell_length_cm: string;
  memo: string;
};

const emptyTortoise: TortoiseForm = {
  name: "",
  species: "",
  birth_date: "",
  adoption_date: "",
};

function localDate() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

function emptyRecord(): RecordForm {
  return {
    measured_on: localDate(),
    weight_g: "",
    shell_length_cm: "",
    memo: "",
  };
}

function GrowthChart({
  records,
  field,
  unit,
}: {
  records: GrowthRecord[];
  field: "weight_g" | "shell_length_cm";
  unit: string;
}) {
  const points = records
    .filter((r) => r[field] !== null)
    .slice()
    .sort(
      (a, b) =>
        a.measured_on.localeCompare(b.measured_on) ||
        a.created_at.localeCompare(b.created_at)
    );

  if (!points.length) {
    return (
      <p className="py-10 text-center text-sm text-[#829482]">
        아직 측정 기록이 없습니다.
      </p>
    );
  }

  const values = points.map((r) => Number(r[field]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.15, max * 0.05, 1);
  const lower = Math.max(0, min - padding);
  const upper = max + padding;
  const width = 600;
  const height = 210;
  const left = 45;
  const right = 15;
  const top = 20;
  const bottom = 35;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const coords = values.map((value, i) => ({
    x:
      left +
      (points.length === 1
        ? plotWidth / 2
        : (i / (points.length - 1)) * plotWidth),
    y:
      top +
      plotHeight -
      ((value - lower) / (upper - lower)) * plotHeight,
  }));

  const line = coords
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${unit} 성장 추이 그래프`}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const y = top + (i / 4) * plotHeight;
          const value = upper - (i / 4) * (upper - lower);

          return (
            <g key={i}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#e5ecdf"
              />
              <text
                x={left - 7}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#829482"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {coords.length > 1 && (
          <polyline
            points={line}
            fill="none"
            stroke="#668b6c"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coords.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#668b6c"
              stroke="white"
              strokeWidth="2"
            />
            <title>
              {points[i].measured_on}: {values[i]} {unit}
            </title>
          </g>
        ))}

        <text
          x={left}
          y={height - 8}
          fontSize="11"
          fill="#829482"
        >
          {points[0].measured_on}
        </text>
        <text
          x={width - right}
          y={height - 8}
          fontSize="11"
          fill="#829482"
          textAnchor="end"
        >
          {points[points.length - 1].measured_on}
        </text>
      </svg>
      <p className="text-right text-xs text-[#829482]">
        단위: {unit} · 측정일 기준
      </p>
    </div>
  );
}

export default function GrowthPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tortoises, setTortoises] = useState<Tortoise[]>([]);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [showTortoiseForm, setShowTortoiseForm] =
    useState(false);
  const [editingTortoise, setEditingTortoise] =
    useState<string | null>(null);
  const [tortoiseForm, setTortoiseForm] =
    useState<TortoiseForm>(emptyTortoise);

  const [showRecordForm, setShowRecordForm] =
    useState(false);
  const [editingRecord, setEditingRecord] =
    useState<string | null>(null);
  const [recordForm, setRecordForm] =
    useState<RecordForm>(emptyRecord());

  const selected = tortoises.find(
    (t) => t.id === selectedId
  );

  const selectedRecords = useMemo(
    () =>
      records
        .filter((r) => r.tortoise_id === selectedId)
        .sort(
          (a, b) =>
            b.measured_on.localeCompare(a.measured_on) ||
            b.created_at.localeCompare(a.created_at)
        ),
    [records, selectedId]
  );

  const load = useCallback(async (uid: string) => {
    const db = getSupabase();
    if (!db) return;

    setLoading(true);

    const [tortoiseResult, recordResult] = await Promise.all([
      db
        .from("tortoises")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true }),
      db
        .from("tortoise_growth_records")
        .select("*")
        .eq("user_id", uid)
        .order("measured_on", { ascending: false }),
    ]);

    if (tortoiseResult.error || recordResult.error) {
      setMessage(
        tortoiseResult.error?.message ||
          recordResult.error?.message ||
          "데이터를 불러오지 못했습니다."
      );
    } else {
      const list = (tortoiseResult.data || []) as Tortoise[];
      setTortoises(list);
      setRecords(
        (recordResult.data || []) as GrowthRecord[]
      );
      setSelectedId((previous) =>
        list.some((t) => t.id === previous)
          ? previous
          : list[0]?.id || ""
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const db = getSupabase();

    if (!db) {
      setMessage("Supabase 연결 설정을 확인해 주세요.");
      setReady(true);
      return;
    }

    let active = true;

    db.auth.getUser().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        setMessage(error.message);
      }

      const uid = data.user?.id || null;
      setUserId(uid);
      setReady(true);

      if (uid) void load(uid);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user?.id || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [load]);

  function newTortoise() {
    setEditingTortoise(null);
    setTortoiseForm(emptyTortoise);
    setShowTortoiseForm(true);
    setMessage("");
  }

  function editTortoise(t: Tortoise) {
    setEditingTortoise(t.id);
    setTortoiseForm({
      name: t.name,
      species: t.species || "",
      birth_date: t.birth_date || "",
      adoption_date: t.adoption_date || "",
    });
    setShowTortoiseForm(true);
    setMessage("");
  }

  async function saveTortoise(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!userId || busy) return;

    const name = tortoiseForm.name.trim();
    if (!name) {
      setMessage("거북이 이름을 입력해 주세요.");
      return;
    }

    const db = getSupabase();
    if (!db) return;

    setBusy(true);
    setMessage("");

    const payload = {
      name,
      species: tortoiseForm.species.trim() || null,
      birth_date: tortoiseForm.birth_date || null,
      adoption_date: tortoiseForm.adoption_date || null,
    };

    const result = editingTortoise
      ? await db
          .from("tortoises")
          .update(payload)
          .eq("id", editingTortoise)
          .eq("user_id", userId)
      : await db.from("tortoises").insert({
          ...payload,
          user_id: userId,
        });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setShowTortoiseForm(false);
      await load(userId);
      setMessage(
        editingTortoise
          ? "거북이 정보가 수정되었습니다."
          : "새 거북이가 등록되었습니다."
      );
    }

    setBusy(false);
  }

  async function deleteTortoise(t: Tortoise) {
    if (!userId || busy) return;

    if (
      !window.confirm(
        `${t.name}의 정보와 모든 성장 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    const db = getSupabase();
    if (!db) return;

    setBusy(true);
    const { error } = await db
      .from("tortoises")
      .delete()
      .eq("id", t.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      await load(userId);
      setMessage("거북이 정보가 삭제되었습니다.");
    }

    setBusy(false);
  }

  function newRecord() {
    setEditingRecord(null);
    setRecordForm(emptyRecord());
    setShowRecordForm(true);
    setMessage("");
  }

  function editRecord(r: GrowthRecord) {
    setEditingRecord(r.id);
    setRecordForm({
      measured_on: r.measured_on,
      weight_g:
        r.weight_g === null ? "" : String(r.weight_g),
      shell_length_cm:
        r.shell_length_cm === null
          ? ""
          : String(r.shell_length_cm),
      memo: r.memo || "",
    });
    setShowRecordForm(true);
    setMessage("");
  }

  async function saveRecord(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!userId || !selectedId || busy) return;

    const weight = recordForm.weight_g.trim()
      ? Number(recordForm.weight_g)
      : null;
    const length = recordForm.shell_length_cm.trim()
      ? Number(recordForm.shell_length_cm)
      : null;

    if (weight === null && length === null) {
      setMessage("몸무게 또는 등갑 길이를 입력해 주세요.");
      return;
    }

    if (
      (weight !== null &&
        (!Number.isFinite(weight) || weight <= 0)) ||
      (length !== null &&
        (!Number.isFinite(length) || length <= 0))
    ) {
      setMessage("측정값은 0보다 커야 합니다.");
      return;
    }

    const db = getSupabase();
    if (!db) return;

    setBusy(true);
    setMessage("");

    const payload = {
      measured_on: recordForm.measured_on,
      weight_g: weight,
      shell_length_cm: length,
      memo: recordForm.memo.trim() || null,
    };

    const result = editingRecord
      ? await db
          .from("tortoise_growth_records")
          .update(payload)
          .eq("id", editingRecord)
          .eq("tortoise_id", selectedId)
          .eq("user_id", userId)
      : await db
          .from("tortoise_growth_records")
          .insert({
            ...payload,
            tortoise_id: selectedId,
            user_id: userId,
          });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setShowRecordForm(false);
      await load(userId);
      setMessage(
        editingRecord
          ? "성장 기록을 수정했습니다."
          : "성장 기록을 저장했습니다."
      );
    }

    setBusy(false);
  }

  async function deleteRecord(r: GrowthRecord) {
    if (!userId || busy) return;
    if (!window.confirm("이 성장 기록을 삭제할까요?"))
      return;

    const db = getSupabase();
    if (!db) return;

    setBusy(true);
    const { error } = await db
      .from("tortoise_growth_records")
      .delete()
      .eq("id", r.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      await load(userId);
      setMessage("성장 기록을 삭제했습니다.");
    }

    setBusy(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#dce7d8] bg-[#f8faf6] px-4 py-3 text-sm outline-none focus:border-[#668b6c]";

  if (!ready) {
    return (
      <main className="container-site min-h-[65vh] py-20 text-center text-[#829482]">
        로그인 상태를 확인하고 있습니다...
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="container-site min-h-[65vh] py-20 text-center text-[#405a46]">
        <Turtle
          size={56}
          className="mx-auto text-[#739578]"
        />
        <h1 className="mt-6 text-3xl font-bold">
          나의 거북이 성장일기
        </h1>
        <p className="mt-4 text-sm text-[#829482]">
          로그인하면 우리 거북이의 성장을 기록할 수 있어요.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
        >
          로그인 / 회원가입
        </Link>
      </main>
    );
  }

  return (
    <main className="container-site min-h-screen pb-24 pt-10 text-[#405a46]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[#829482] hover:text-[#668b6c]"
      >
        <ArrowLeft size={16} />
        홈으로
      </Link>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#8ca18a]">
            MY TORTOISE DIARY
          </p>
          <h1 className="mt-2 font-hand text-4xl">
            우리 거북이 성장일기
          </h1>
          <p className="mt-3 text-sm text-[#829482]">
            조금씩 자라는 소중한 순간을 기록해요.
          </p>
        </div>

        <button
          onClick={newTortoise}
          className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-5 py-3 text-sm font-bold text-white hover:bg-[#527558]"
        >
          <Plus size={17} />
          거북이 등록
        </button>
      </div>

      {message && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-[#edf5e8] p-4 text-sm text-[#608566]"
        >
          {message}
        </p>
      )}

      {showTortoiseForm && (
        <section className="mt-7 rounded-[24px] border border-[#dce7d8] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingTortoise
                ? "거북이 정보 수정"
                : "새 거북이 등록"}
            </h2>
            <button
              type="button"
              onClick={() => setShowTortoiseForm(false)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={saveTortoise}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <label className="text-sm font-semibold">
              이름 *
              <input
                required
                maxLength={40}
                value={tortoiseForm.name}
                onChange={(e) =>
                  setTortoiseForm({
                    ...tortoiseForm,
                    name: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="예: 꼬북이"
              />
            </label>

            <label className="text-sm font-semibold">
              종류
              <input
                maxLength={100}
                value={tortoiseForm.species}
                onChange={(e) =>
                  setTortoiseForm({
                    ...tortoiseForm,
                    species: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="예: 헤르만 육지거북"
              />
            </label>

            <label className="text-sm font-semibold">
              생일
              <input
                type="date"
                value={tortoiseForm.birth_date}
                onChange={(e) =>
                  setTortoiseForm({
                    ...tortoiseForm,
                    birth_date: e.target.value,
                  })
                }
                className={inputClass}
              />
            </label>

            <label className="text-sm font-semibold">
              입양일
              <input
                type="date"
                value={tortoiseForm.adoption_date}
                onChange={(e) =>
                  setTortoiseForm({
                    ...tortoiseForm,
                    adoption_date: e.target.value,
                  })
                }
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2"
            >
              <Save size={17} />
              {busy ? "저장 중..." : "거북이 정보 저장"}
            </button>
          </form>
        </section>
      )}

      {loading && (
        <p className="mt-6 text-sm text-[#829482]">
          성장일기를 불러오는 중...
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <h2 className="mb-4 text-lg font-bold">
            나의 거북이 ({tortoises.length})
          </h2>

          {!tortoises.length && (
            <div className="rounded-2xl border border-dashed border-[#dce7d8] bg-white p-6 text-center text-sm text-[#829482]">
              아직 등록된 거북이가 없어요.
              <br />
              첫 거북이를 등록해 보세요!
            </div>
          )}

          {tortoises.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedId(t.id);
                setShowRecordForm(false);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                selectedId === t.id
                  ? "border-[#91b094] bg-[#edf5e8]"
                  : "border-[#e3e9df] bg-white hover:bg-[#f8faf6]"
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#668b6c]">
                <Turtle size={27} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold">
                  {t.name}
                </span>
                <span className="block truncate text-xs text-[#829482]">
                  {t.species || "종류 미입력"}
                </span>
              </span>
            </button>
          ))}
        </aside>

        <div className="min-w-0 space-y-6">
          {selected ? (
            <>
              <section className="rounded-[24px] border border-[#e3e9df] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#8ca18a]">
                      MY LITTLE FRIEND
                    </p>
                    <h2 className="mt-2 font-hand text-3xl">
                      {selected.name}
                    </h2>
                    <p className="mt-2 text-sm text-[#829482]">
                      {selected.species || "종류 미입력"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editTortoise(selected)}
                      className="rounded-xl border border-[#dce7d8] p-3 text-[#668b6c]"
                      aria-label="거북이 수정"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTortoise(selected)}
                      disabled={busy}
                      className="rounded-xl border border-[#f0dddd] p-3 text-[#b56b6b]"
                      aria-label="거북이 삭제"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#829482]">
                  {selected.birth_date && (
                    <span className="rounded-full bg-[#f3f7ef] px-3 py-2">
                      생일 {selected.birth_date}
                    </span>
                  )}
                  {selected.adoption_date && (
                    <span className="rounded-full bg-[#f3f7ef] px-3 py-2">
                      입양일 {selected.adoption_date}
                    </span>
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-[#e3e9df] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                      <NotebookPen size={20} />
                      성장 기록
                    </h2>
                    <p className="mt-2 text-sm text-[#829482]">
                      총 {selectedRecords.length}개의 기록
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={newRecord}
                    className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-5 py-3 text-sm font-bold text-white"
                  >
                    <Plus size={16} />
                    기록 추가
                  </button>
                </div>

                {showRecordForm && (
                  <form
                    onSubmit={saveRecord}
                    className="mt-6 grid gap-4 rounded-2xl bg-[#f8faf6] p-5 sm:grid-cols-2"
                  >
                    <label className="text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        측정일 *
                      </span>
                      <input
                        required
                        type="date"
                        value={recordForm.measured_on}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            measured_on: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      몸무게 (g)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={recordForm.weight_g}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            weight_g: e.target.value,
                          })
                        }
                        placeholder="예: 250"
                        className={inputClass}
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      등갑 길이 (cm)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={recordForm.shell_length_cm}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            shell_length_cm: e.target.value,
                          })
                        }
                        placeholder="예: 10.5"
                        className={inputClass}
                      />
                    </label>

                    <label className="text-sm font-semibold sm:col-span-2">
                      메모
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={recordForm.memo}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            memo: e.target.value,
                          })
                        }
                        placeholder="오늘의 식사, 활동, 특이사항을 기록해 보세요."
                        className={inputClass}
                      />
                    </label>

                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded-xl bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {busy ? "저장 중..." : "기록 저장"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRecordForm(false)}
                        className="rounded-xl border border-[#dce7d8] bg-white px-6 py-3 text-sm font-bold"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 space-y-3">
                  {!selectedRecords.length && (
                    <p className="py-8 text-center text-sm text-[#829482]">
                      아직 성장 기록이 없어요.
                    </p>
                  )}

                  {selectedRecords.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-[#e5ecdf] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {r.measured_on}
                          </p>
                          <p className="mt-2 text-sm text-[#668b6c]">
                            {r.weight_g !== null &&
                              `몸무게 ${r.weight_g}g`}
                            {r.weight_g !== null &&
                              r.shell_length_cm !== null &&
                              " · "}
                            {r.shell_length_cm !== null &&
                              `등갑 ${r.shell_length_cm}cm`}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editRecord(r)}
                            aria-label="기록 수정"
                            className="text-[#668b6c]"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord(r)}
                            disabled={busy}
                            aria-label="기록 삭제"
                            className="text-[#b56b6b]"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      {r.memo && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#829482]">
                          {r.memo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-[#e3e9df] bg-white p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <ChartNoAxesCombined size={21} />
                  성장 그래프
                </h2>

                <div className="mt-7">
                  <h3 className="mb-3 text-sm font-bold">
                    몸무게 변화
                  </h3>
                  <GrowthChart
                    records={selectedRecords}
                    field="weight_g"
                    unit="g"
                  />
                </div>

                <div className="mt-8 border-t border-[#e5ecdf] pt-7">
                  <h3 className="mb-3 text-sm font-bold">
                    등갑 길이 변화
                  </h3>
                  <GrowthChart
                    records={selectedRecords}
                    field="shell_length_cm"
                    unit="cm"
                  />
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-[24px] border border-[#e3e9df] bg-white px-6 py-16 text-center">
              <Turtle
                size={50}
                className="mx-auto text-[#91b094]"
              />
              <h2 className="mt-5 text-xl font-bold">
                첫 거북이를 등록해 주세요
              </h2>
              <p className="mt-3 text-sm text-[#829482]">
                등록 후 몸무게와 등갑 길이를 기록할 수 있어요.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
