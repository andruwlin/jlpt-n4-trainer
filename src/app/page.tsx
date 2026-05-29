import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { n4Words, n5Words, words } from "@/data/words";

const entries = [
  {
    href: "/vocabulary",
    title: "Vocabulary",
    label: "單字卡",
    description: "依 N5 / N4 篩選、搜尋 kana、kanji 或中文意思，並用發音按鈕練聽力。",
    cta: "開始瀏覽",
  },
  {
    href: "/exam",
    title: "Exam",
    label: "練習模式",
    description: "中文意思選擇題與日文句子填空題，session 內即時統計答題狀態。",
    cta: "開始練習",
  },
  {
    href: "#",
    title: "Progress",
    label: "錯題 / 進度",
    description: "未來可加入錯題本、熟悉度與複習紀錄。v0-B 先保留入口。",
    cta: "Coming soon",
    disabled: true,
  },
];

export default function Home() {
  return (
    <AppShell
      title="N4/N5 日文練習"
      description="用精簡的 curated sample bank 先建立穩定的單字瀏覽與 Exam 練習流程。"
    >
      <section className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/85 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-ink">{words.length}</p>
          <p className="text-xs font-bold text-ink/55">Total</p>
        </div>
        <div className="rounded-lg bg-white/85 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-matcha">{n5Words.length}</p>
          <p className="text-xs font-bold text-ink/55">N5</p>
        </div>
        <div className="rounded-lg bg-white/85 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-matcha">{n4Words.length}</p>
          <p className="text-xs font-bold text-ink/55">N4</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {entries.map((entry) => {
          const content = (
            <article
              className={`h-full rounded-lg border border-white/80 bg-white/90 p-5 shadow-card transition ${
                entry.disabled ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-lg"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-normal text-matcha">{entry.label}</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">{entry.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{entry.description}</p>
              <div
                className={`mt-5 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                  entry.disabled ? "bg-paper text-ink/55" : "bg-ink text-white"
                }`}
              >
                {entry.cta}
              </div>
            </article>
          );

          return entry.disabled ? (
            <div key={entry.title}>{content}</div>
          ) : (
            <Link key={entry.title} href={entry.href}>
              {content}
            </Link>
          );
        })}
      </section>
    </AppShell>
  );
}
