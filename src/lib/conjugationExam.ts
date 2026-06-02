import type { ConjugationCategory, ConjugationLevel, ConjugationRule } from "@/data/conjugation";

export type ConjugationExamLevel = ConjugationLevel | "Mixed";
export type ConjugationExamCategory = "all" | ConjugationCategory;
export type ConjugationExamMode = "form-choice" | "result-choice" | "mixed";
export type ConjugationQuestionType = Exclude<ConjugationExamMode, "mixed">;

export type ConjugationExamQuestion = {
  id: string;
  type: ConjugationQuestionType;
  rule: ConjugationRule;
  example: ConjugationRule["examples"][number];
  choices: string[];
  answer: string;
};

type GenerateConjugationExamSessionInput = {
  conjugationRules: ConjugationRule[];
  selectedLevel: ConjugationExamLevel;
  selectedCategory: ConjugationExamCategory;
  selectedQuestionType: ConjugationExamMode;
  questionCount?: number;
};

type ExampleItem = {
  key: string;
  rule: ConjugationRule;
  example: ConjugationRule["examples"][number];
};

export function generateConjugationExamSession({
  conjugationRules,
  selectedLevel,
  selectedCategory,
  selectedQuestionType,
  questionCount = 20,
}: GenerateConjugationExamSessionInput): ConjugationExamQuestion[] {
  const rules = getRulesForSelection(conjugationRules, selectedLevel, selectedCategory);
  const items = shuffle(flattenExamples(rules));
  const questionTypes = buildQuestionTypes(selectedQuestionType, questionCount);
  const questions: ConjugationExamQuestion[] = [];
  const usedKeys = new Set<string>();

  for (const type of questionTypes) {
    const item = items.find((candidate) => !usedKeys.has(candidate.key) && canBuildQuestion(rules, candidate, type));

    if (!item) {
      continue;
    }

    const question = buildQuestion(rules, item, type, questions.length + 1);
    if (!question) {
      continue;
    }

    usedKeys.add(item.key);
    questions.push(question);

    if (questions.length >= questionCount) {
      break;
    }
  }

  return questions;
}

function getRulesForSelection(
  rules: ConjugationRule[],
  level: ConjugationExamLevel,
  category: ConjugationExamCategory,
) {
  return rules.filter((rule) => {
    const matchesLevel = level === "Mixed" || rule.level === level;
    const matchesCategory = category === "all" || rule.category === category;
    return matchesLevel && matchesCategory;
  });
}

function flattenExamples(rules: ConjugationRule[]): ExampleItem[] {
  return rules.flatMap((rule) =>
    rule.examples.map((example, index) => ({
      key: `${rule.id}-${example.base}-${example.result}-${index}`,
      rule,
      example,
    })),
  );
}

function canBuildQuestion(rules: ConjugationRule[], item: ExampleItem, type: ConjugationQuestionType) {
  const getValue = type === "result-choice" ? (candidate: ExampleItem) => candidate.example.result : (candidate: ExampleItem) => candidate.rule.title;
  const uniqueChoices = new Set(flattenExamples(rules).map(getValue));
  const answer = getValue(item);
  return uniqueChoices.has(answer) && uniqueChoices.size >= 4;
}

function buildQuestion(
  rules: ConjugationRule[],
  item: ExampleItem,
  type: ConjugationQuestionType,
  index: number,
): ConjugationExamQuestion | undefined {
  if (type === "result-choice") {
    const choices = buildChoices(rules, item, (candidate) => candidate.example.result);
    if (choices.length < 4) {
      return undefined;
    }

    return {
      id: `${type}-${item.key}-${index}`,
      type,
      rule: item.rule,
      example: item.example,
      choices,
      answer: item.example.result,
    };
  }

  const choices = buildChoices(rules, item, (candidate) => candidate.rule.title);
  if (choices.length < 4) {
    return undefined;
  }

  return {
    id: `${type}-${item.key}-${index}`,
    type,
    rule: item.rule,
    example: item.example,
    choices,
    answer: item.rule.title,
  };
}

function buildChoices(
  rules: ConjugationRule[],
  answerItem: ExampleItem,
  getValue: (item: ExampleItem) => string,
) {
  const answer = getValue(answerItem);
  const distractors = shuffle(
    flattenExamples(rules)
      .filter((item) => item.key !== answerItem.key)
      .map(getValue)
      .filter((value, index, values) => value !== answer && values.indexOf(value) === index),
  ).slice(0, 3);

  return distractors.length === 3 ? shuffle([answer, ...distractors]) : [];
}

function buildQuestionTypes(mode: ConjugationExamMode, count: number): ConjugationQuestionType[] {
  if (mode !== "mixed") {
    return Array.from({ length: count }, () => mode);
  }

  return shuffle(
    Array.from({ length: count }, (_, index): ConjugationQuestionType =>
      index % 2 === 0 ? "form-choice" : "result-choice",
    ),
  );
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
