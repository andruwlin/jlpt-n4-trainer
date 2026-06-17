import type { ConjugationRule } from "@/data/conjugation";
import type { GrammarPoint } from "@/data/grammar";
import type { JLPTWord } from "@/data/words";
import {
  getDueWeakItems,
  getWeakItemPriority,
  type ExamKind,
  type LearningProgressState,
  type WeakItemRecord,
} from "@/lib/progress";

export type ReviewKindFilter = "all" | ExamKind;
export type ReviewScope = "due" | "all";
export type ReviewQuestionKind = ExamKind;

export type VocabularyReviewQuestion = {
  id: string;
  kind: "vocabulary";
  weakItem: WeakItemRecord;
  word: JLPTWord;
  choices: string[];
  answer: string;
};

export type GrammarReviewQuestion = {
  id: string;
  kind: "grammar";
  weakItem: WeakItemRecord;
  grammar: GrammarPoint;
  choices: string[];
  answer: string;
};

export type ConjugationReviewQuestion = {
  id: string;
  kind: "conjugation";
  type: "result-choice" | "form-choice";
  weakItem: WeakItemRecord;
  rule: ConjugationRule;
  example: ConjugationRule["examples"][number];
  choices: string[];
  answer: string;
};

export type ReviewQuestion = VocabularyReviewQuestion | GrammarReviewQuestion | ConjugationReviewQuestion;

export type ReviewDataBanks = {
  words: JLPTWord[];
  grammarPoints: GrammarPoint[];
  conjugationRules: ConjugationRule[];
};

type GenerateReviewSessionInput = {
  weakItems: WeakItemRecord[];
  dataBanks: ReviewDataBanks;
  kind: ReviewKindFilter;
  scope?: ReviewScope;
  questionLimit?: number;
  recentlySeenSourceIds?: string[];
};

type ConjugationExampleItem = {
  rule: ConjugationRule;
  example: ConjugationRule["examples"][number];
};

export const REVIEW_QUESTION_LIMIT = 30;

export function getReviewableWeakItems(progress: LearningProgressState, kind: ReviewKindFilter, scope: ReviewScope) {
  const baseItems = scope === "due" ? getDueWeakItems(progress) : progress.weakItems;
  const filtered = kind === "all" ? baseItems : baseItems.filter((item) => item.kind === kind);

  return [...filtered].sort((a, b) => getWeakItemPriority(b) - getWeakItemPriority(a));
}

export function generateReviewSession({
  weakItems,
  dataBanks,
  kind,
  scope = "all",
  questionLimit = REVIEW_QUESTION_LIMIT,
  recentlySeenSourceIds = [],
}: GenerateReviewSessionInput): ReviewQuestion[] {
  const now = new Date();
  const baseItems = scope === "due" ? weakItems.filter((item) => isDue(item, now)) : weakItems;
  const reviewableWeakItems = sortByPriority(
    kind === "all" ? baseItems : baseItems.filter((item) => item.kind === kind),
    recentlySeenSourceIds,
    now,
  );
  const questions: ReviewQuestion[] = [];
  const usedSourceIds = new Set<string>();

  for (const weakItem of reviewableWeakItems) {
    if (usedSourceIds.has(`${weakItem.kind}:${weakItem.sourceId}`)) {
      continue;
    }

    const question = buildReviewQuestion(weakItem, dataBanks, questions.length + 1);
    if (!question) {
      continue;
    }

    usedSourceIds.add(`${weakItem.kind}:${weakItem.sourceId}`);
    questions.push(question);
    if (questions.length >= questionLimit) {
      break;
    }
  }

  return questions;
}

function buildReviewQuestion(
  weakItem: WeakItemRecord,
  dataBanks: ReviewDataBanks,
  index: number,
): ReviewQuestion | undefined {
  if (weakItem.kind === "vocabulary") {
    return buildVocabularyQuestion(weakItem, dataBanks.words, index);
  }

  if (weakItem.kind === "grammar") {
    return buildGrammarQuestion(weakItem, dataBanks.grammarPoints, index);
  }

  return buildConjugationQuestion(weakItem, dataBanks.conjugationRules, index);
}

function buildVocabularyQuestion(
  weakItem: WeakItemRecord,
  words: JLPTWord[],
  index: number,
): VocabularyReviewQuestion | undefined {
  const word = words.find((item) => item.id === weakItem.sourceId);
  if (!word) {
    return undefined;
  }

  const choices = buildChoices(words, word, (item) => item.meaningZh);
  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `review-vocabulary-${word.id}-${index}`,
    kind: "vocabulary",
    weakItem,
    word,
    choices,
    answer: word.meaningZh,
  };
}

function buildGrammarQuestion(
  weakItem: WeakItemRecord,
  grammarPoints: GrammarPoint[],
  index: number,
): GrammarReviewQuestion | undefined {
  const grammar = grammarPoints.find((item) => item.id === weakItem.sourceId);
  if (!grammar) {
    return undefined;
  }

  const choices = buildChoices(grammarPoints, grammar, (item) => item.meaningZh);
  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `review-grammar-${grammar.id}-${index}`,
    kind: "grammar",
    weakItem,
    grammar,
    choices,
    answer: grammar.meaningZh,
  };
}

function buildConjugationQuestion(
  weakItem: WeakItemRecord,
  rules: ConjugationRule[],
  index: number,
): ConjugationReviewQuestion | undefined {
  const item = findConjugationExample(weakItem.sourceId, rules);
  if (!item) {
    return undefined;
  }

  const type = index % 2 === 0 ? "form-choice" : "result-choice";
  const allExamples = flattenConjugationExamples(rules);
  const choices =
    type === "result-choice"
      ? buildChoices(allExamples, item, (candidate) => candidate.example.result)
      : buildChoices(allExamples, item, (candidate) => candidate.rule.title);

  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `review-conjugation-${item.rule.id}-${item.example.base}-${item.example.result}-${index}`,
    kind: "conjugation",
    type,
    weakItem,
    rule: item.rule,
    example: item.example,
    choices,
    answer: type === "result-choice" ? item.example.result : item.rule.title,
  };
}

function findConjugationExample(sourceId: string, rules: ConjugationRule[]) {
  for (const rule of rules) {
    const example = rule.examples.find((item) => sourceId === `${rule.id}-${item.base}-${item.result}`);
    if (example) {
      return { rule, example };
    }
  }

  return undefined;
}

function flattenConjugationExamples(rules: ConjugationRule[]): ConjugationExampleItem[] {
  return rules.flatMap((rule) => rule.examples.map((example) => ({ rule, example })));
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

function sortByPriority(items: WeakItemRecord[], recentlySeenSourceIds: string[], now: Date) {
  return shuffle(items).sort(
    (a, b) =>
      getWeakItemPriority(b, now, recentlySeenSourceIds) - getWeakItemPriority(a, now, recentlySeenSourceIds),
  );
}

function isDue(item: WeakItemRecord, now: Date) {
  const nextReviewAt = item.nextReviewAt ?? item.lastWrongAt;
  const nextReviewTime = new Date(nextReviewAt).getTime();
  return !Number.isFinite(nextReviewTime) || nextReviewTime <= now.getTime();
}
