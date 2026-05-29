# JLPT N5/N4 Trainer

Next.js + TypeScript + Tailwind CSS PWA sample app for JLPT-style vocabulary practice.

目前資料是 curated learning sample bank，目的是支援產品原型與學習練習流程；不是官方完整 JLPT 清單，也不是從官方或 copyrighted / scraped 資料建立。

## Features

- Home dashboard with three entries: Vocabulary, Exam, Progress coming soon
- Vocabulary browser with level filter: All / N5 / N4
- Search by kana, kanji, or Chinese meaning
- 160 local sample words: N5 80 + N4 80
- Word cards show kana, kanji, Traditional Chinese meaning, part of speech, Japanese example, and Chinese translation
- Browser `speechSynthesis` pronunciation with `ja-JP`
- Exam mode with session-only React state
- Meaning choice questions
- Japanese sentence fill questions

## Tech

- Next.js
- TypeScript
- Tailwind CSS
- Local TypeScript data only
- No database
- No external API

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

## Data Shape

```ts
type JLPTWord = {
  id: string;
  level: "N5" | "N4";
  kana: string;
  kanji?: string;
  meaningZh: string;
  partOfSpeech: string;
  exampleJa: string;
  exampleZh: string;
  tags: string[];
};
```
