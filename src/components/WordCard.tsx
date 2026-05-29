"use client";

import type { JLPTWord } from "@/data/words";
import { speakJapanese } from "@/lib/speech";

type WordCardProps = {
  word: JLPTWord;
};

export function WordCard({ word }: WordCardProps) {
  const textToSpeak = word.kanji ?? word.kana;

  return (
    <article className="w-full rounded-lg border border-ink/10 bg-white/90 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-2xl font-bold leading-tight text-ink">{word.kana}</p>
          <p className="mt-1 break-words text-base font-semibold text-ink/70">
            {word.kanji ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => speakJapanese(textToSpeak)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-matcha/30 bg-matcha/10 text-sm font-bold text-matcha transition hover:bg-matcha/20 focus:outline-none focus:ring-2 focus:ring-matcha/40"
          aria-label={`${textToSpeak} を発音`}
          title="發音"
        >
          音
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-semibold text-ink">
          {word.partOfSpeech}
        </span>
        <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-semibold text-matcha">
          {word.level}
        </span>
      </div>

      <p className="mt-3 text-base font-semibold leading-relaxed text-ink">{word.meaningZh}</p>

      <div className="mt-4 rounded-lg bg-paper px-3 py-3">
        <p className="break-words text-sm font-semibold leading-6 text-ink">{word.exampleJa}</p>
        <p className="mt-1 break-words text-sm leading-6 text-ink/65">{word.exampleZh}</p>
      </div>
    </article>
  );
}
