"use client";

import type { ConjugationExamCategory, ConjugationExamLevel, ConjugationExamMode } from "@/lib/conjugationExam";

type ConjugationExamSetupProps = {
  level: ConjugationExamLevel;
  category: ConjugationExamCategory;
  mode: ConjugationExamMode;
  onLevelChange: (level: ConjugationExamLevel) => void;
  onCategoryChange: (category: ConjugationExamCategory) => void;
  onModeChange: (mode: ConjugationExamMode) => void;
  onStart: () => void;
};

const levels: ConjugationExamLevel[] = ["N5", "N4", "Mixed"];
const categories: { value: ConjugationExamCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verb", label: "Verb" },
  { value: "i-adjective", label: "い形容詞" },
  { value: "na-adjective", label: "な形容詞" },
  { value: "noun", label: "名詞" },
];
const modes: { value: ConjugationExamMode; label: string }[] = [
  { value: "result-choice", label: "選變化" },
  { value: "form-choice", label: "選規則" },
  { value: "mixed", label: "混合" },
];

export function ConjugationExamSetup({
  level,
  category,
  mode,
  onLevelChange,
  onCategoryChange,
  onModeChange,
  onStart,
}: ConjugationExamSetupProps) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-6">
      <div className="grid gap-5">
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">Level</legend>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLevelChange(item)}
                className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                  level === item ? "border-matcha bg-matcha text-white" : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">Category</legend>
          <div className="grid grid-cols-2 gap-2 min-[460px]:grid-cols-5 lg:grid-cols-3">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onCategoryChange(item.value)}
                className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                  category === item.value
                    ? "border-matcha bg-matcha text-white"
                    : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">題型</legend>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 lg:grid-cols-3">
            {modes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onModeChange(item.value)}
                className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                  mode === item.value
                    ? "border-matcha bg-matcha text-white"
                    : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 w-full rounded-lg bg-ink px-4 py-4 text-base font-bold text-white shadow-card transition hover:bg-ink/90"
      >
        Start Conjugation Exam
      </button>
    </section>
  );
}
