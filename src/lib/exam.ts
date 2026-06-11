import type { JLPTLevel, JLPTWord } from "@/data/words";

export type ExamLevel = JLPTLevel | "Mixed";
export type ExamMode = "meaning-choice" | "sentence-fill" | "mixed";
export type QuestionType = Exclude<ExamMode, "mixed">;

export type ExamQuestion = {
  id: string;
  type: QuestionType;
  word: JLPTWord;
  prompt?: string;
  choices: string[];
  answer: string;
  blankSentence?: string;
};

type GenerateExamSessionInput = {
  words: JLPTWord[];
  selectedLevel: ExamLevel;
  selectedQuestionType: ExamMode;
  questionCount?: number;
  recentlySeenSourceIds?: string[];
};

export function getWordsForLevel(words: JLPTWord[], level: ExamLevel) {
  if (level === "Mixed") {
    return words;
  }

  return words.filter((word) => word.level === level);
}

export function generateExamSession({
  words,
  selectedLevel,
  selectedQuestionType,
  questionCount = 20,
  recentlySeenSourceIds = [],
}: GenerateExamSessionInput): ExamQuestion[] {
  const pool = getWordsForLevel(words, selectedLevel);
  const total = Math.min(questionCount, pool.length);
  const sessionWords = pickSessionWords(pool, total, recentlySeenSourceIds);
  const questionTypes = buildQuestionTypes(selectedQuestionType, total);

  return sessionWords.map((word, index) =>
    buildQuestion(pool, word, questionTypes[index] ?? "meaning-choice", index + 1),
  );
}

export function buildQuestion(
  words: JLPTWord[],
  word: JLPTWord,
  type: QuestionType,
  index: number,
): ExamQuestion {
  const uniqueId = `${type}-${word.id}-${index}`;

  if (type === "sentence-fill") {
    const answer = displayJapanese(word);
    return {
      id: uniqueId,
      type,
      word,
      choices: buildChoices(words, word, displayJapanese),
      answer,
      blankSentence: blankExample(word),
    };
  }

  return {
    id: uniqueId,
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

function pickSessionWords(words: JLPTWord[], count: number, recentlySeenSourceIds: string[]) {
  const sortedWords = sortByRecentlySeen(words, (word) => word.id, recentlySeenSourceIds);

  if (count <= words.length) {
    return sortedWords.slice(0, count);
  }

  const selected: JLPTWord[] = [];
  while (selected.length < count) {
    selected.push(...sortedWords.slice(0, count - selected.length));
  }

  return selected;
}

function buildQuestionTypes(mode: ExamMode, count: number): QuestionType[] {
  if (mode !== "mixed") {
    return Array.from({ length: count }, () => mode);
  }

  const types = Array.from({ length: count }, (_, index): QuestionType =>
    index % 2 === 0 ? "meaning-choice" : "sentence-fill",
  );

  return shuffle(types);
}

function blankExample(word: JLPTWord) {
  return word.exampleJa;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function sortByRecentlySeen<T>(items: T[], getSourceId: (item: T) => string, recentlySeenSourceIds: string[]) {
  const recentlySeen = new Set(recentlySeenSourceIds);
  const shuffled = shuffle(items);
  return [
    ...shuffled.filter((item) => !recentlySeen.has(getSourceId(item))),
    ...shuffled.filter((item) => recentlySeen.has(getSourceId(item))),
  ];
}
