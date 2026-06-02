"use client";

import { useEffect, useState } from "react";
import {
  clearProgress,
  getAccuracyByKind,
  getProgress,
  getRecentResults,
  getTodayStats,
  getWeakItems,
  type ExamKind,
  type ExamResultRecord,
  type TodayStats,
  type WeakItemRecord,
} from "@/lib/progress";

const kindLabels: Record<ExamKind, string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  conjugation: "Conjugation",
};

type DashboardSnapshot = {
  today: TodayStats;
  accuracyByKind: Record<ExamKind, number | undefined>;
  recentResults: ExamResultRecord[];
  weakItems: WeakItemRecord[];
};

const emptySnapshot: DashboardSnapshot = {
  today: {
    questionCount: 0,
    examCount: 0,
    totalExamCount: 0,
  },
  accuracyByKind: {
    vocabulary: undefined,
    grammar: undefined,
    conjugation: undefined,
  },
  recentResults: [],
  weakItems: [],
};

export function DashboardClient() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);

  function refresh() {
    setSnapshot({
      today: getTodayStats(),
      accuracyByKind: getAccuracyByKind(),
      recentResults: getRecentResults(8),
      weakItems: getWeakItems(10),
    });
  }

  function handleClear() {
    if (!window.confirm("確定要清除本機學習紀錄嗎？")) {
      return;
    }

    clearProgress();
    refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  const hasProgress = getProgress().results.length > 0 || getProgress().weakItems.length > 0;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="今日練習題數" value={snapshot.today.questionCount} />
        <SummaryCard label="今日完成測驗" value={snapshot.today.examCount} />
        <SummaryCard
          label="最近一次正確率"
          value={snapshot.today.lastAccuracy === undefined ? "尚未練習" : `${snapshot.today.lastAccuracy}%`}
        />
        <SummaryCard label="累積完成測驗" value={snapshot.today.totalExamCount} />
      </section>

      <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-matcha">Accuracy by Kind</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">分類正確率</h2>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
          >
            Clear Progress
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(Object.keys(kindLabels) as ExamKind[]).map((kind) => (
            <AccuracyCard key={kind} label={kindLabels[kind]} value={snapshot.accuracyByKind[kind]} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-5">
          <p className="text-sm font-bold text-matcha">Recent Results</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">最近測驗</h2>
          {snapshot.recentResults.length > 0 ? (
            <div className="mt-4 space-y-3">
              {snapshot.recentResults.map((result) => (
                <div key={result.id} className="rounded-lg bg-paper p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-ink">{kindLabels[result.kind]}</p>
                    <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
                      {result.accuracy}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {result.level} · {result.questionType} · {result.correct}/{result.total}
                  </p>
                  <p className="text-xs font-bold text-ink/45">{formatDateTime(result.completedAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="尚未完成測驗。完成一次 20 題 session 後，結果會出現在這裡。" />
          )}
        </div>

        <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-5">
          <p className="text-sm font-bold text-matcha">Weak Items</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">錯題紀錄</h2>
          {snapshot.weakItems.length > 0 ? (
            <div className="mt-4 space-y-3">
              {snapshot.weakItems.map((item) => (
                <div key={item.id} className="rounded-lg bg-paper p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words font-bold text-ink">{item.label}</p>
                    <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-bold text-ink">
                      x{item.wrongCount}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {kindLabels[item.kind]}{item.level ? ` · ${item.level}` : ""}
                  </p>
                  <p className="text-xs font-bold text-ink/45">{formatDateTime(item.lastWrongAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text={hasProgress ? "目前沒有錯題紀錄。" : "答錯的題目會累積在這裡，方便之後回頭複習。"} />
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-card">
      <p className="text-sm font-bold text-ink/55">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

function AccuracyCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-ink">{label}</p>
        <p className="text-sm font-bold text-matcha">{value === undefined ? "尚未練習" : `${value}%`}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-matcha" style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-ink/15 bg-paper/70 p-5 text-sm font-bold leading-6 text-ink/55">
      {text}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
