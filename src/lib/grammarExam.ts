import type { GrammarLevel, GrammarPoint } from "@/data/grammar";

export type GrammarExamLevel = GrammarLevel | "Mixed";
export type GrammarExamMode = "meaning-choice" | "sentence-fill" | "mixed";
export type GrammarQuestionType = Exclude<GrammarExamMode, "mixed">;

export type GrammarExamQuestion = {
  id: string;
  type: GrammarQuestionType;
  grammar: GrammarPoint;
  choices: string[];
  answer: string;
  questionText?: string;
  blankSentence?: string;
};

type GenerateGrammarExamSessionInput = {
  grammarPoints: GrammarPoint[];
  selectedLevel: GrammarExamLevel;
  selectedQuestionType: GrammarExamMode;
  questionCount?: number;
  recentlySeenSourceIds?: string[];
};

export function getGrammarForLevel(grammarPoints: GrammarPoint[], level: GrammarExamLevel) {
  if (level === "Mixed") {
    return grammarPoints;
  }

  return grammarPoints.filter((grammar) => grammar.level === level);
}

export function generateGrammarExamSession({
  grammarPoints,
  selectedLevel,
  selectedQuestionType,
  questionCount = 20,
  recentlySeenSourceIds = [],
}: GenerateGrammarExamSessionInput): GrammarExamQuestion[] {
  const pool = getGrammarForLevel(grammarPoints, selectedLevel);
  const total = Math.min(questionCount, pool.length);
  const sessionGrammar = sortByRecentlySeen(pool, (grammar) => grammar.id, recentlySeenSourceIds).slice(0, total);
  const questionTypes = buildQuestionTypes(selectedQuestionType, total);

  return sessionGrammar.map((grammar, index) =>
    buildGrammarQuestion(pool, grammar, questionTypes[index] ?? "meaning-choice", index + 1),
  );
}

function buildGrammarQuestion(
  grammarPoints: GrammarPoint[],
  grammar: GrammarPoint,
  type: GrammarQuestionType,
  index: number,
): GrammarExamQuestion {
  const uniqueId = `${type}-${grammar.id}-${index}`;

  if (type === "sentence-fill") {
    const blankSentence = blankGrammarExample(grammar);

    return {
      id: uniqueId,
      type,
      grammar,
      choices: buildChoices(grammarPoints, grammar, (item) => item.pattern),
      answer: grammar.pattern,
      blankSentence,
      questionText:
        blankSentence === grammar.exampleJa
          ? "選出讓整句日文自然成立的文法"
          : "補上空格，使句子文法正確且自然",
    };
  }

  return {
    id: uniqueId,
    type,
    grammar,
    choices: buildChoices(grammarPoints, grammar, (item) => item.meaningZh),
    answer: grammar.meaningZh,
  };
}

function buildChoices(
  grammarPoints: GrammarPoint[],
  answerGrammar: GrammarPoint,
  getValue: (grammar: GrammarPoint) => string,
) {
  const answer = getValue(answerGrammar);
  const distractors = shuffle(
    grammarPoints
      .filter((grammar) => grammar.id !== answerGrammar.id)
      .map(getValue)
      .filter((value, index, values) => value !== answer && values.indexOf(value) === index),
  ).slice(0, 3);

  return shuffle([answer, ...distractors]);
}

function blankGrammarExample(grammar: GrammarPoint) {
  const candidates = getBlankCandidates(grammar.pattern);
  const target = candidates.find((candidate) => grammar.exampleJa.includes(candidate));

  if (!target) {
    return grammar.exampleJa;
  }

  return grammar.exampleJa.replace(target, "＿＿");
}

function getBlankCandidates(pattern: string) {
  const normalized = pattern.replace(/（.+?）/g, "").trim();
  const candidates = [
    normalized,
    normalized.replace(/^た/, ""),
    normalized.replace(/^て/, ""),
    normalized.replace(/^ない/, ""),
    normalized.replace(/^の/, ""),
  ].filter(Boolean);

  return Array.from(new Set(candidates)).sort((a, b) => b.length - a.length);
}

function buildQuestionTypes(mode: GrammarExamMode, count: number): GrammarQuestionType[] {
  if (mode !== "mixed") {
    return Array.from({ length: count }, () => mode);
  }

  const types = Array.from({ length: count }, (_, index): GrammarQuestionType =>
    index % 2 === 0 ? "meaning-choice" : "sentence-fill",
  );

  return shuffle(types);
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
