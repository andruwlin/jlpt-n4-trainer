"use client";

import type { ExamLevel, ExamMode } from "@/lib/exam";

type ExamSetupProps = {
  level: ExamLevel;
  mode: ExamMode;
  onLevelChange: (level: ExamLevel) => void;
  onModeChange: (mode: ExamMode) => void;
  onStart: () => void;
};

const levels: ExamLevel[] = ["N5", "N4", "Mixed"];
const modes: { value: ExamMode; label: string }[] = [
  { value: "meaning-choice", label: "中文意思" },
  { value: "sentence-fill", label: "日文填空" },
  { value: "mixed", label: "混合" },
];

export function ExamSetup({ level, mode, onLevelChange, onModeChange, onStart }: ExamSetupProps) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-card sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">Level</legend>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLevelChange(item)}
                className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                  level === item
                    ? "border-matcha bg-matcha text-white"
                    : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">題型</legend>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-1 lg:grid-cols-3">
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
        Start Exam
      </button>
    </section>
  );
}
