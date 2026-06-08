"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearProgress,
  getAccuracyByKind,
  getProgress,
  getRecentResults,
  getTodayStats,
  getWeakItems,
  type ExamKind,
  type ExamResultKind,
  type ExamResultRecord,
  type TodayStats,
  type WeakItemRecord,
} from "@/lib/progress";

const kindLabels: Record<ExamResultKind, string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  conjugation: "Conjugation",
  daily: "Daily Practice",
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

  const hasResults = snapshot.recentResults.length > 0;
  const hasProgress = hasResults || snapshot.weakItems.length > 0;

  return (
    <div className="space-y-5">
      {!hasResults ? <DashboardEmptyState /> : null}

      <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-matcha">Local Progress</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              進度只會儲存在目前這台裝置與瀏覽器。清除瀏覽器資料或換裝置後，Dashboard 會重新開始。
            </p>
            <p className="mt-1 text-sm leading-6 text-ink/55">
              Progress is saved locally in this browser. Clearing browser data or using another device will reset the
              dashboard.
            </p>
          </div>
          {hasResults ? (
            <Link href="/daily-practice" className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white">
              Daily Practice
              <span className="block text-xs font-bold text-white/75">每日 20 題</span>
            </Link>
          ) : null}
        </div>
      </section>

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
          {(["vocabulary", "grammar", "conjugation"] as ExamKind[]).map((kind) => (
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
            <EmptyState text="完成一次測驗後會顯示最近紀錄。" />
          )}
        </div>

        <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-matcha">Weak Items</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">錯題紀錄</h2>
            </div>
            {snapshot.weakItems.length > 0 ? (
              <Link
                href="/review"
                className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white"
              >
                Review weak items
                <span className="block text-xs font-bold text-white/75">錯題重練</span>
              </Link>
            ) : null}
          </div>
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
            <EmptyState text={hasProgress ? "目前沒有錯題，保持下去！" : "答錯的題目會累積在這裡，方便之後回頭複習。"} />
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardEmptyState() {
  const ctas = [
    { href: "/daily-practice", label: "Start Daily Practice", description: "混合 20 題" },
    { href: "/exam", label: "Start Vocabulary Exam", description: "單字 20 題" },
    { href: "/grammar-exam", label: "Start Grammar Exam", description: "文法 20 題" },
    { href: "/conjugation-exam", label: "Start Conjugation Exam", description: "活用 20 題" },
  ];

  return (
    <section className="rounded-lg border border-matcha/20 bg-white/90 p-5 shadow-card sm:p-7">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-matcha">No practice history yet</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-ink">還沒有練習紀錄</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          完成一次 20 題測驗後，這裡會開始記錄你的學習進度。Your progress is saved only on this device.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {ctas.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className="rounded-lg border border-ink/10 bg-paper px-4 py-4 transition hover:border-matcha/30 hover:bg-matcha/10"
          >
            <p className="text-sm font-bold text-ink">{cta.label}</p>
            <p className="mt-1 text-xs font-bold text-ink/50">{cta.description}</p>
          </Link>
        ))}
      </div>
    </section>
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
