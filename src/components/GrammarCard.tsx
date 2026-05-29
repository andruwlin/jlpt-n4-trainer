"use client";

import type { GrammarPoint } from "@/data/grammar";
import { speakJapanese } from "@/lib/speech";

type GrammarCardProps = {
  grammar: GrammarPoint;
};

export function GrammarCard({ grammar }: GrammarCardProps) {
  return (
    <article className="w-full rounded-lg border border-ink/10 bg-white/90 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
            {grammar.level}
          </span>
          <h2 className="mt-3 break-words text-2xl font-bold leading-tight text-ink">
            {grammar.pattern}
          </h2>
          <p className="mt-2 text-base font-bold leading-6 text-ink/75">{grammar.meaningZh}</p>
        </div>
        <button
          type="button"
          onClick={() => speakJapanese(grammar.exampleJa)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-matcha/30 bg-matcha/10 text-sm font-bold text-matcha transition hover:bg-matcha/20 focus:outline-none focus:ring-2 focus:ring-matcha/40"
          aria-label="朗讀例句"
          title="朗讀例句"
        >
          音
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-paper px-3 py-3">
        <p className="text-xs font-bold text-ink/50">接續 / 結構</p>
        <p className="mt-1 break-words text-sm font-bold leading-6 text-ink">{grammar.structure}</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/75">{grammar.explanationZh}</p>

      <div className="mt-4 rounded-lg bg-sakura/10 px-3 py-3">
        <p className="break-words text-sm font-bold leading-6 text-ink">{grammar.exampleJa}</p>
        <p className="mt-1 break-words text-sm leading-6 text-ink/65">{grammar.exampleZh}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {grammar.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/55">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
