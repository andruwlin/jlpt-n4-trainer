"use client";

import type { ReviewKindFilter } from "@/lib/review";

type ReviewSetupProps = {
  kind: ReviewKindFilter;
  totalWeakItems: number;
  availableQuestions: number;
  questionLimit: number;
  onKindChange: (kind: ReviewKindFilter) => void;
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
  totalWeakItems,
  availableQuestions,
  questionLimit,
  onKindChange,
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
        共有 {totalWeakItems} 個本機錯題。{availableQuestions > 0 ? cappedText : "目前篩選沒有可重練題目。"}
      </p>

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
