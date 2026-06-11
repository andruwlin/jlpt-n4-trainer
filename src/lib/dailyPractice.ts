import type { ConjugationLevel, ConjugationRule } from "@/data/conjugation";
import type { GrammarLevel, GrammarPoint } from "@/data/grammar";
import type { JLPTLevel, JLPTWord } from "@/data/words";
import type { WeakItemRecord } from "@/lib/progress";

export type DailyPracticeLevel = JLPTLevel | "Mixed";

export type DailyVocabularyQuestion = {
  id: string;
  kind: "vocabulary";
  sourceId: string;
  word: JLPTWord;
  choices: string[];
  answer: string;
  isWeakItem: boolean;
};

export type DailyGrammarQuestion = {
  id: string;
  kind: "grammar";
  sourceId: string;
  grammar: GrammarPoint;
  choices: string[];
  answer: string;
  isWeakItem: boolean;
};

export type DailyConjugationQuestion = {
  id: string;
  kind: "conjugation";
  sourceId: string;
  rule: ConjugationRule;
  example: ConjugationRule["examples"][number];
  choices: string[];
  answer: string;
  isWeakItem: boolean;
};

export type DailyPracticeQuestion = DailyVocabularyQuestion | DailyGrammarQuestion | DailyConjugationQuestion;

type GenerateDailyPracticeSessionInput = {
  level: DailyPracticeLevel;
  words: JLPTWord[];
  grammarPoints: GrammarPoint[];
  conjugationRules: ConjugationRule[];
  weakItems: WeakItemRecord[];
  questionCount?: number;
  recentlySeenSourceIds?: string[];
};

type ConjugationExampleItem = {
  sourceId: string;
  rule: ConjugationRule;
  example: ConjugationRule["examples"][number];
};

const WEAK_ITEM_LIMIT = 8;

export function generateDailyPracticeSession({
  level,
  words,
  grammarPoints,
  conjugationRules,
  weakItems,
  questionCount = 20,
  recentlySeenSourceIds = [],
}: GenerateDailyPracticeSessionInput): DailyPracticeQuestion[] {
  const questions: DailyPracticeQuestion[] = [];
  const usedSourceIds = new Set<string>();
  const pools = {
    words: filterByLevel(words, level),
    grammarPoints: filterByLevel(grammarPoints, level),
    conjugationRules: filterByLevel(conjugationRules, level),
  };

  const weakQuestions = buildWeakQuestions({
    weakItems,
    words: pools.words,
    grammarPoints: pools.grammarPoints,
    conjugationRules: pools.conjugationRules,
    usedSourceIds,
    limit: Math.min(WEAK_ITEM_LIMIT, questionCount),
    recentlySeenSourceIds,
  });

  questions.push(...weakQuestions);

  const hasWeakQuestions = weakQuestions.length > 0;
  const targetMix = hasWeakQuestions
    ? { vocabulary: 6, grammar: 4, conjugation: 2 }
    : { vocabulary: 10, grammar: 6, conjugation: 4 };

  addNormalQuestions("vocabulary", targetMix.vocabulary, questions, usedSourceIds, pools, recentlySeenSourceIds);
  addNormalQuestions("grammar", targetMix.grammar, questions, usedSourceIds, pools, recentlySeenSourceIds);
  addNormalQuestions("conjugation", targetMix.conjugation, questions, usedSourceIds, pools, recentlySeenSourceIds);

  while (questions.length < questionCount) {
    const before = questions.length;
    addNormalQuestions("vocabulary", 1, questions, usedSourceIds, pools, recentlySeenSourceIds);
    addNormalQuestions("grammar", 1, questions, usedSourceIds, pools, recentlySeenSourceIds);
    addNormalQuestions("conjugation", 1, questions, usedSourceIds, pools, recentlySeenSourceIds);

    if (questions.length === before) {
      break;
    }
  }

  return shuffle(questions).slice(0, questionCount).map((question, index) => ({
    ...question,
    id: `${question.id}-${index + 1}`,
  }));
}

function buildWeakQuestions({
  weakItems,
  words,
  grammarPoints,
  conjugationRules,
  usedSourceIds,
  limit,
  recentlySeenSourceIds,
}: {
  weakItems: WeakItemRecord[];
  words: JLPTWord[];
  grammarPoints: GrammarPoint[];
  conjugationRules: ConjugationRule[];
  usedSourceIds: Set<string>;
  limit: number;
  recentlySeenSourceIds: string[];
}) {
  const questions: DailyPracticeQuestion[] = [];
  const sortedWeakItems = [...weakItems].sort((a, b) => {
    if (b.wrongCount !== a.wrongCount) {
      return b.wrongCount - a.wrongCount;
    }

    return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
  });

  for (const weakItem of sortByRecentlySeen(sortedWeakItems, (item) => item.sourceId, recentlySeenSourceIds)) {
    if (questions.length >= limit) {
      break;
    }

    const question = buildWeakQuestion(weakItem, words, grammarPoints, conjugationRules);
    if (!question || usedSourceIds.has(question.sourceId)) {
      continue;
    }

    usedSourceIds.add(question.sourceId);
    questions.push(question);
  }

  return questions;
}

function buildWeakQuestion(
  weakItem: WeakItemRecord,
  words: JLPTWord[],
  grammarPoints: GrammarPoint[],
  conjugationRules: ConjugationRule[],
) {
  if (weakItem.kind === "vocabulary") {
    const word = words.find((item) => item.id === weakItem.sourceId);
    return word ? buildVocabularyQuestion(word, words, true) : undefined;
  }

  if (weakItem.kind === "grammar") {
    const grammar = grammarPoints.find((item) => item.id === weakItem.sourceId);
    return grammar ? buildGrammarQuestion(grammar, grammarPoints, true) : undefined;
  }

  const item = findConjugationExample(weakItem.sourceId, conjugationRules);
  return item ? buildConjugationQuestion(item, conjugationRules, true) : undefined;
}

function addNormalQuestions(
  kind: DailyPracticeQuestion["kind"],
  count: number,
  questions: DailyPracticeQuestion[],
  usedSourceIds: Set<string>,
  pools: {
    words: JLPTWord[];
    grammarPoints: GrammarPoint[];
    conjugationRules: ConjugationRule[];
  },
  recentlySeenSourceIds: string[],
) {
  for (let index = 0; index < count; index += 1) {
    const question = buildNormalQuestion(kind, pools, usedSourceIds, recentlySeenSourceIds);
    if (!question) {
      return;
    }

    usedSourceIds.add(question.sourceId);
    questions.push(question);
  }
}

function buildNormalQuestion(
  kind: DailyPracticeQuestion["kind"],
  pools: {
    words: JLPTWord[];
    grammarPoints: GrammarPoint[];
    conjugationRules: ConjugationRule[];
  },
  usedSourceIds: Set<string>,
  recentlySeenSourceIds: string[],
) {
  if (kind === "vocabulary") {
    const word = sortByRecentlySeen(pools.words, (item) => item.id, recentlySeenSourceIds).find((item) => !usedSourceIds.has(item.id));
    return word ? buildVocabularyQuestion(word, pools.words, false) : undefined;
  }

  if (kind === "grammar") {
    const grammar = sortByRecentlySeen(pools.grammarPoints, (item) => item.id, recentlySeenSourceIds).find((item) => !usedSourceIds.has(item.id));
    return grammar ? buildGrammarQuestion(grammar, pools.grammarPoints, false) : undefined;
  }

  const examples = sortByRecentlySeen(flattenConjugationExamples(pools.conjugationRules), (item) => item.sourceId, recentlySeenSourceIds);
  const item = examples.find((candidate) => !usedSourceIds.has(candidate.sourceId));
  return item ? buildConjugationQuestion(item, pools.conjugationRules, false) : undefined;
}

function buildVocabularyQuestion(
  word: JLPTWord,
  words: JLPTWord[],
  isWeakItem: boolean,
): DailyVocabularyQuestion | undefined {
  const choices = buildChoices(words, word, (item) => item.meaningZh);
  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `daily-vocabulary-${word.id}`,
    kind: "vocabulary",
    sourceId: word.id,
    word,
    choices,
    answer: word.meaningZh,
    isWeakItem,
  };
}

function buildGrammarQuestion(
  grammar: GrammarPoint,
  grammarPoints: GrammarPoint[],
  isWeakItem: boolean,
): DailyGrammarQuestion | undefined {
  const choices = buildChoices(grammarPoints, grammar, (item) => item.meaningZh);
  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `daily-grammar-${grammar.id}`,
    kind: "grammar",
    sourceId: grammar.id,
    grammar,
    choices,
    answer: grammar.meaningZh,
    isWeakItem,
  };
}

function buildConjugationQuestion(
  item: ConjugationExampleItem,
  rules: ConjugationRule[],
  isWeakItem: boolean,
): DailyConjugationQuestion | undefined {
  const choices = buildChoices(flattenConjugationExamples(rules), item, (candidate) => candidate.example.result);
  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `daily-conjugation-${item.sourceId}`,
    kind: "conjugation",
    sourceId: item.sourceId,
    rule: item.rule,
    example: item.example,
    choices,
    answer: item.example.result,
    isWeakItem,
  };
}

function findConjugationExample(sourceId: string, rules: ConjugationRule[]) {
  return flattenConjugationExamples(rules).find((item) => item.sourceId === sourceId);
}

function flattenConjugationExamples(rules: ConjugationRule[]): ConjugationExampleItem[] {
  return rules.flatMap((rule) =>
    rule.examples.map((example) => ({
      sourceId: `${rule.id}-${example.base}-${example.result}`,
      rule,
      example,
    })),
  );
}

function buildChoices<T>(items: T[], answerItem: T, getValue: (item: T) => string) {
  const answer = getValue(answerItem);
  const distractors = shuffle(
    items
      .filter((item) => item !== answerItem)
      .map(getValue)
      .filter((value, index, values) => value !== answer && values.indexOf(value) === index),
  ).slice(0, 3);

  return distractors.length === 3 ? shuffle([answer, ...distractors]) : [];
}

function filterByLevel<T extends { level: JLPTLevel | GrammarLevel | ConjugationLevel }>(items: T[], level: DailyPracticeLevel) {
  if (level === "Mixed") {
    return items;
  }

  return items.filter((item) => item.level === level);
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
