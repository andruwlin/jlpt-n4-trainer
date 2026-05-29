"use client";

import { useMemo, useState } from "react";
import { WordCard } from "@/components/WordCard";
import type { JLPTLevel, JLPTWord } from "@/data/words";

type LevelFilter = "All" | JLPTLevel;

type VocabularyBrowserProps = {
  words: JLPTWord[];
};

const levels: LevelFilter[] = ["All", "N5", "N4"];

export function VocabularyBrowser({ words }: VocabularyBrowserProps) {
  const [level, setLevel] = useState<LevelFilter>("All");
  const [query, setQuery] = useState("");

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return words.filter((word) => {
      const matchesLevel = level === "All" || word.level === level;
      const searchable = `${word.kana} ${word.kanji ?? ""} ${word.meaningZh}`.toLowerCase();
      return matchesLevel && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [level, query, words]);

  return (
    <>
      <section className="mb-5 rounded-lg border border-white/80 bg-white/85 p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="text-sm font-bold text-ink">搜尋</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="kana / kanji / 中文意思"
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
        <p className="mt-3 text-sm font-bold text-ink/60">{filteredWords.length} words</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="單字卡列表">
        {filteredWords.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </section>
    </>
  );
}
