"use client";

import type { DailyPracticeLevel } from "@/lib/dailyPractice";

type DailyPracticeSetupProps = {
  level: DailyPracticeLevel;
  weakItemCount: number;
  onLevelChange: (level: DailyPracticeLevel) => void;
  onStart: () => void;
};

const levels: DailyPracticeLevel[] = ["Mixed", "N5", "N4"];

export function DailyPracticeSetup({ level, weakItemCount, onLevelChange, onStart }: DailyPracticeSetupProps) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-card sm:p-5">
      <p className="text-sm font-bold text-matcha">Daily Practice</p>
      <h2 className="mt-1 text-2xl font-bold text-ink">今日 20 題混合練習</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        會優先加入你的錯題，再混合單字、文法、活用。Progress will be saved locally on this device.
      </p>
      <p className="mt-2 text-sm font-bold text-ink/55">目前本機錯題：{weakItemCount}</p>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold text-ink/55">Level</p>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onLevelChange(option)}
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                level === option
                  ? "border-matcha bg-matcha/15 text-matcha"
                  : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-5 w-full rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white"
      >
        Start Daily Practice
      </button>
    </section>
  );
}
