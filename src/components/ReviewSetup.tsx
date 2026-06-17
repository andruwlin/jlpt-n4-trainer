"use client";

import type { ReviewKindFilter, ReviewScope } from "@/lib/review";

type ReviewSetupProps = {
  kind: ReviewKindFilter;
  scope: ReviewScope;
  totalWeakItems: number;
  dueWeakItems: number;
  availableQuestions: number;
  questionLimit: number;
  onKindChange: (kind: ReviewKindFilter) => void;
  onScopeChange: (scope: ReviewScope) => void;
  onStart: () => void;
};

const kindOptions: { value: ReviewKindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "conjugation", label: "Conjugation" },
];

export function ReviewSetup({
  kind,
  scope,
  totalWeakItems,
  dueWeakItems,
  availableQuestions,
  questionLimit,
  onKindChange,
  onScopeChange,
  onStart,
}: ReviewSetupProps) {
  const cappedText =
    availableQuestions > questionLimit
      ? `會從 ${availableQuestions} 個可重練錯題中選最多 ${questionLimit} 題。`
      : `本次會練習 ${availableQuestions} 題。`;

  return (
    <section className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-card sm:p-5">
      <p className="text-sm font-bold text-matcha">Review Setup</p>
      <h2 className="mt-1 text-2xl font-bold text-ink">錯題重練設定</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        共有 {totalWeakItems} 個本機錯題，其中 {dueWeakItems} 個到期。{availableQuestions > 0 ? cappedText : "目前篩選沒有可重練題目。"}
      </p>

      {dueWeakItems === 0 && totalWeakItems > 0 && scope === "due" ? (
        <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm font-bold leading-6 text-ink/65">
          目前沒有到期錯題。你仍可切換到全部錯題練習。
        </p>
      ) : null}

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold text-ink/55">Review scope</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "due" as const, label: "到期錯題", subLabel: "Due only" },
            { value: "all" as const, label: "全部錯題", subLabel: "All weak items" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onScopeChange(option.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                scope === option.value
                  ? "border-matcha bg-matcha/15 text-matcha"
                  : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
              }`}
            >
              {option.label}
              <span className="block text-xs font-bold opacity-65">{option.subLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold text-ink/55">Review kind</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kindOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onKindChange(option.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                kind === option.value
                  ? "border-matcha bg-matcha/15 text-matcha"
                  : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={availableQuestions === 0}
        className="mt-5 w-full rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-ink/35"
      >
        Start Review
      </button>
    </section>
  );
}
