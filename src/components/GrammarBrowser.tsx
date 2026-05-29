"use client";

import { useMemo, useState } from "react";
import { GrammarCard } from "@/components/GrammarCard";
import type { GrammarLevel, GrammarPoint } from "@/data/grammar";

type LevelFilter = "All" | GrammarLevel;

type GrammarBrowserProps = {
  grammarPoints: GrammarPoint[];
};

const levels: LevelFilter[] = ["All", "N5", "N4"];

export function GrammarBrowser({ grammarPoints }: GrammarBrowserProps) {
  const [level, setLevel] = useState<LevelFilter>("All");
  const [query, setQuery] = useState("");

  const filteredGrammar = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return grammarPoints.filter((grammar) => {
      const matchesLevel = level === "All" || grammar.level === level;
      const searchable =
        `${grammar.pattern} ${grammar.meaningZh} ${grammar.explanationZh} ${grammar.exampleJa}`.toLowerCase();

      return matchesLevel && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [grammarPoints, level, query]);

  return (
    <>
      <section className="mb-5 rounded-lg border border-white/80 bg-white/85 p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="text-sm font-bold text-ink">搜尋</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="pattern / 中文意思 / 說明 / 例句"
              className="mt-2 w-full rounded-lg border border-ink/10 bg-paper px-4 py-3 text-base text-ink outline-none focus:border-matcha focus:ring-2 focus:ring-matcha/20"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">Level</p>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLevel(item)}
                  className={`rounded-lg border px-3 py-3 text-sm font-bold ${
                    level === item
                      ? "border-matcha bg-matcha text-white"
                      : "border-ink/10 bg-paper text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-ink/60">{filteredGrammar.length} grammar points</p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="文法卡列表">
        {filteredGrammar.map((grammar) => (
          <GrammarCard key={grammar.id} grammar={grammar} />
        ))}
      </section>
    </>
  );
}
