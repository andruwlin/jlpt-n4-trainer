import type { JLPTLevel, JLPTWord } from "@/data/words";

export type ExamLevel = JLPTLevel | "Mixed";
export type ExamMode = "meaning-choice" | "sentence-fill" | "mixed";
export type QuestionType = Exclude<ExamMode, "mixed">;

export type ExamQuestion = {
  id: string;
  type: QuestionType;
  word: JLPTWord;
  prompt: string;
  choices: string[];
  answer: string;
  blankSentence?: string;
};

export function getWordsForLevel(words: JLPTWord[], level: ExamLevel) {
  if (level === "Mixed") {
    return words;
  }

  return words.filter((word) => word.level === level);
}

export function buildQuestion(words: JLPTWord[], mode: ExamMode, index: number): ExamQuestion {
  const type: QuestionType =
    mode === "mixed" ? (Math.random() > 0.5 ? "meaning-choice" : "sentence-fill") : mode;
  const word = pickRandom(words);

  if (type === "sentence-fill") {
    const answer = displayJapanese(word);
    return {
      id: `${type}-${word.id}-${index}`,
      type,
      word,
      prompt: word.meaningZh,
      choices: buildChoices(words, word, displayJapanese),
      answer,
      blankSentence: blankExample(word),
    };
  }

  return {
    id: `${type}-${word.id}-${index}`,
    type,
    word,
    prompt: `${word.kanji ? `${word.kanji}（${word.kana}）` : word.kana}`,
    choices: buildChoices(words, word, (item) => item.meaningZh),
    answer: word.meaningZh,
  };
}

export function displayJapanese(word: JLPTWord) {
  return word.kanji ?? word.kana;
}

function buildChoices(
  words: JLPTWord[],
  answerWord: JLPTWord,
  getValue: (word: JLPTWord) => string,
) {
  const answer = getValue(answerWord);
  const distractors = shuffle(
    words
      .filter((word) => word.id !== answerWord.id)
      .map(getValue)
      .filter((value, index, values) => value !== answer && values.indexOf(value) === index),
  ).slice(0, 3);

  return shuffle([answer, ...distractors]);
}

function blankExample(word: JLPTWord) {
  const target = word.kanji ?? word.kana;

  if (word.exampleJa.includes(target)) {
    return word.exampleJa.replace(target, "＿＿");
  }

  if (word.kanji && word.exampleJa.includes(word.kana)) {
    return word.exampleJa.replace(word.kana, "＿＿");
  }

  return `＿＿：${word.exampleJa}`;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
