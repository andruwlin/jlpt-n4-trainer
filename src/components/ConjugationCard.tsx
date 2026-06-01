"use client";

import type { ConjugationRule } from "@/data/conjugation";
import { speakJapanese } from "@/lib/speech";

type ConjugationCardProps = {
  rule: ConjugationRule;
};

const categoryLabels: Record<ConjugationRule["category"], string> = {
  verb: "Verb",
  "i-adjective": "い形容詞",
  "na-adjective": "な形容詞",
  noun: "名詞",
};

export function ConjugationCard({ rule }: ConjugationCardProps) {
  return (
    <article className="w-full rounded-lg border border-ink/10 bg-white/90 p-4 shadow-card">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
          {rule.level}
        </span>
        <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-bold text-ink">
          {categoryLabels[rule.category]}
        </span>
      </div>

      <h2 className="mt-3 break-words text-2xl font-bold leading-tight text-ink">{rule.title}</h2>
      <p className="mt-2 text-base font-bold leading-6 text-ink/75">{rule.form}</p>

      <div className="mt-4 rounded-lg bg-paper px-3 py-3">
        <p className="text-xs font-bold text-ink/50">Rule</p>
        <p className="mt-1 break-words text-sm font-bold leading-6 text-ink">{rule.rule}</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/75">{rule.explanationZh}</p>

      <div className="mt-4 space-y-3">
        {rule.examples.map((example) => (
          <div key={`${example.base}-${example.result}`} className="rounded-lg bg-sakura/10 px-3 py-3">
            <div className="grid gap-2 text-sm min-[460px]:grid-cols-[1fr_auto_1fr] min-[460px]:items-center">
              <p className="break-words font-bold text-ink">{example.base}</p>
              <p className="hidden text-ink/35 min-[460px]:block">→</p>
              <p className="break-words font-bold text-matcha">{example.result}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/65">{example.meaningZh}</p>
            {example.exampleJa ? (
              <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-white/70 p-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold leading-6 text-ink">{example.exampleJa}</p>
                  {example.exampleZh ? (
                    <p className="mt-1 break-words text-sm leading-6 text-ink/65">{example.exampleZh}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(example.exampleJa ?? "")}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-matcha/30 bg-matcha/10 text-xs font-bold text-matcha"
                  aria-label="朗讀例句"
                  title="朗讀例句"
                >
                  音
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {rule.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/55">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
