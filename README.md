# JLPT N5/N4 Trainer

Next.js + TypeScript + Tailwind CSS PWA sample app for JLPT-style vocabulary practice.

目前資料是 curated learning sample bank，目的是支援產品原型與學習練習流程；不是官方完整 JLPT 清單，也不是從官方或 copyrighted / scraped 資料建立。
Vocabulary bank, grammar bank, and conjugation content are curated learning samples. They are designed to grow gradually and are not official complete JLPT lists.
Progress Lite is saved locally in the browser with `localStorage`; there is no login, database, or cloud sync yet. Clearing browser data will clear progress.
Weak Items Review Mode uses local weak items stored in `localStorage`; weak items are local to the browser/device and do not require login, database, or cloud sync.
Daily Practice is a 20-question mixed practice session that can include local weak items, vocabulary, grammar, and conjugation. Progress remains local-only through `localStorage`.
Grammar sentence-fill questions focus on making the whole Japanese sentence grammatically natural. Some questions require paying attention to the connection before and after the blank.

Current curated content counts after v0-K:
- Vocabulary: N5 300 / N4 300
- Grammar: N5 45 / N4 45
- Conjugation: 38 total rules

## Features

- Home dashboard with three entries: Vocabulary, Exam, Progress coming soon
- Vocabulary browser with level filter: All / N5 / N4
- Search by kana, kanji, or Chinese meaning
- 600 local sample words: N5 300 + N4 300
- 90 local sample grammar points: N5 45 + N4 45
- Conjugation Teaching page with curated N5 / N4 verb, adjective, and noun form samples
- Word cards show kana, kanji, Traditional Chinese meaning, part of speech, Japanese example, and Chinese translation
- Grammar cards show pattern, meaning, structure, explanation, examples, tags, and example speech
- Browser `speechSynthesis` pronunciation with `ja-JP`
- Exam mode with session-only React state
- Fixed 20-question exam session when enough words are available
- Meaning choice questions
- Japanese sentence fill questions
- Grammar Exam uses curated learning sample grammar data with fixed 20-question sessions
- Grammar Exam is not an official complete JLPT grammar exam
- Grammar sentence-fill questions ask learners to choose the grammar that makes the full Japanese sentence natural
- Conjugation Exam uses curated learning sample conjugation data with fixed 20-question sessions
- Conjugation Exam is not an official complete JLPT exam
- Dashboard / Progress Lite tracks recent exam results, local accuracy, and weak items
- Dashboard empty state explains that progress starts after completing an exam; progress is local-only
- Weak Items Review Mode lets learners review local Vocabulary, Grammar, and Conjugation mistakes with four-choice questions
- Daily Practice mixes weak items, vocabulary, grammar, and conjugation in one 20-question session
- v0-J includes light UI polish for a more consistent mobile-first learning experience

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
npm run check:words
npm run check:grammar
npm run check:conjugation
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
# jlpt-n4-trainer
