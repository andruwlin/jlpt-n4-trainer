"use client";

import { useMemo, useState } from "react";
import { ConjugationCard } from "@/components/ConjugationCard";
import type { ConjugationCategory, ConjugationLevel, ConjugationRule } from "@/data/conjugation";

type LevelFilter = "All" | ConjugationLevel;
type CategoryFilter = "All" | ConjugationCategory;

type ConjugationBrowserProps = {
  rules: ConjugationRule[];
};

const levels: LevelFilter[] = ["All", "N5", "N4"];
const categories: { value: CategoryFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "verb", label: "Verb" },
  { value: "i-adjective", label: "い形容詞" },
  { value: "na-adjective", label: "な形容詞" },
  { value: "noun", label: "名詞" },
];

export function ConjugationBrowser({ rules }: ConjugationBrowserProps) {
  const [level, setLevel] = useState<LevelFilter>("All");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");

  const filteredRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesLevel = level === "All" || rule.level === level;
      const matchesCategory = category === "All" || rule.category === category;
      const exampleText = rule.examples
        .map((example) => `${example.base} ${example.result} ${example.meaningZh}`)
        .join(" ");
      const searchable = `${rule.title} ${rule.form} ${rule.explanationZh} ${rule.rule} ${exampleText}`.toLowerCase();

      return matchesLevel && matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, level, query, rules]);

  return (
    <>
      <section className="mb-5 rounded-lg border border-white/80 bg-white/85 p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-bold text-ink">搜尋</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="title / form / rule / examples"
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
                    level === item ? "border-matcha bg-matcha text-white" : "border-ink/10 bg-paper text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">Category</p>
            <div className="grid grid-cols-2 gap-2 min-[460px]:grid-cols-5 lg:grid-cols-5">
              {categories.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`rounded-lg border px-3 py-3 text-sm font-bold ${
                    category === item.value
                      ? "border-matcha bg-matcha text-white"
                      : "border-ink/10 bg-paper text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-ink/60">{filteredRules.length} rules</p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="詞性變化卡列表">
        {filteredRules.map((rule) => (
          <ConjugationCard key={rule.id} rule={rule} />
        ))}
      </section>
    </>
  );
}
