# JLPT Trainer Quality Skill

Use this skill before making changes to the JLPT N4/N5 Trainer app.

## Product goal

Build a simple, pleasant Japanese learning app for JLPT N5/N4 learners.

The app should help users practice:
- vocabulary
- meaning recognition
- sentence fill-in
- grammar patterns
- conjugation rules

The app is a learning aid, not an official JLPT product.

## Hard rules

- Do not claim the word bank is an official complete JLPT list.
- Do not scrape or copy copyrighted JLPT lists.
- Do not add huge low-quality generated datasets.
- Grow data gradually in small batches.
- Prefer fewer, higher-quality entries over many questionable entries.
- Keep examples short, natural, and appropriate for N5/N4.
- Use Traditional Chinese explanations for Taiwan users.
- Do not connect external APIs unless explicitly requested.
- Do not add a database unless explicitly requested.
- Do not break the current 20-question exam flow.

## Vocabulary data rules

Each word must have:
- id
- level: N5 or N4
- kana
- kanji optional
- meaningZh
- partOfSpeech
- exampleJa
- exampleZh
- tags

Quality checks:
- no duplicate id
- no duplicate kana + kanji pair
- no missing required fields
- exampleJa should naturally include the target word when possible
- exampleZh should match exampleJa
- N5 should stay basic
- N4 should be slightly more difficult than N5
- avoid uncertain JLPT levels

## Exam rules

Exam sessions should:
- default to 20 questions
- generate a fixed question queue at the start
- show progress like Question 3 / 20
- not continue infinitely
- avoid repeated words in the same session when possible
- use 4 unique options
- not reveal hints before the user answers
- show explanations only after answering
- show a result summary at the end

## Grammar rules

Grammar content should include:
- level
- pattern
- meaningZh
- explanationZh
- structure
- exampleJa
- exampleZh
- tags

Grammar teaching should be clear and beginner-friendly.

Do not add grammar exams before the grammar teaching data is stable.

## Conjugation rules

Conjugation content should focus on:
- verb groups
- masu form
- te form
- nai form
- ta form
- i-adjective changes
- na-adjective changes
- noun sentence patterns

Conjugation exams should not be added until teaching pages are clear.

## UI rules

- Mobile-first.
- 375px width must not overflow.
- Keep the style clean, soft, and Japanese-learning friendly.
- Do not overcomplicate the UI.
- Preserve vocabulary, exam, and speech features when adding new sections.

## Required checks

After changes, run:
- npm run check:words if available
- npm run lint if available
- npm run build

Manual smoke:
- Vocabulary page works
- Search/filter works
- Exam starts
- Exam ends after 20 questions
- Result Summary appears
- Speech button still works
- Mobile 375px has no horizontal overflow
