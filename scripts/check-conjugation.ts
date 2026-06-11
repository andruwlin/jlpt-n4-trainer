import { conjugationRules } from "../src/data/conjugation";
import type { ConjugationRule } from "../src/data/conjugation";

const allowedLevels = new Set(["N5", "N4"]);
const allowedCategories = new Set(["verb", "i-adjective", "na-adjective", "noun"]);
const commonIAdjectiveBases = new Set([
  "安い",
  "高い",
  "早い",
  "新しい",
  "古い",
  "大きい",
  "小さい",
  "暑い",
  "寒い",
  "おいしい",
]);
const requiredStringFields = [
  "id",
  "level",
  "title",
  "category",
  "form",
  "explanationZh",
  "rule",
] satisfies Array<keyof ConjugationRule>;

const errors: string[] = [];
const warnings: string[] = [];
const seenIds = new Map<string, number>();
const seenTitles = new Map<string, string>();
const seenExampleSentences = new Map<string, string>();

conjugationRules.forEach((rule, index) => {
  const label = rule.id || `conjugation rule at index ${index}`;

  for (const field of requiredStringFields) {
    const value = rule[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${label}: missing required field "${field}"`);
    }
  }

  if (!allowedLevels.has(rule.level)) {
    errors.push(`${label}: invalid level "${rule.level}"`);
  }

  if (!allowedCategories.has(rule.category)) {
    errors.push(`${label}: invalid category "${rule.category}"`);
  }

  if (!Array.isArray(rule.tags) || rule.tags.length === 0) {
    errors.push(`${label}: tags must be a non-empty array`);
  }

  if (!Array.isArray(rule.examples) || rule.examples.length === 0) {
    errors.push(`${label}: examples must be a non-empty array`);
  } else {
    let iAdjectiveLikeCount = 0;

    rule.examples.forEach((example, exampleIndex) => {
      for (const field of ["base", "result", "meaningZh"] as const) {
        if (typeof example[field] !== "string" || example[field].trim() === "") {
          errors.push(`${label}: example ${exampleIndex + 1} missing "${field}"`);
        }
      }

      if (commonIAdjectiveBases.has(example.base)) {
        iAdjectiveLikeCount += 1;

        if (rule.category === "verb") {
          errors.push(`${label}: verb rule example ${exampleIndex + 1} uses common i-adjective base "${example.base}"`);
        }
      }

      if (example.exampleJa) {
        const previousExampleId = seenExampleSentences.get(example.exampleJa.trim());
        if (previousExampleId) {
          warnings.push(`${label}: repeated exampleJa in example ${exampleIndex + 1} also used by ${previousExampleId}`);
        }
        seenExampleSentences.set(example.exampleJa.trim(), `${label} example ${exampleIndex + 1}`);
      }
    });

    if (rule.category === "i-adjective" && rule.examples.length > 1 && iAdjectiveLikeCount === 0) {
      errors.push(`${label}: i-adjective rule examples should include at least one clear i-adjective base`);
    }
  }

  if (rule.id) {
    const previousIndex = seenIds.get(rule.id);
    if (previousIndex !== undefined) {
      errors.push(`${label}: duplicate id also used at index ${previousIndex}`);
    }
    seenIds.set(rule.id, index);
  }

  const titleKey = rule.title.trim();
  const previousId = seenTitles.get(titleKey);
  if (previousId) {
    errors.push(`${label}: duplicate title also used by ${previousId}`);
  }
  seenTitles.set(titleKey, label);
});

const counts = conjugationRules.reduce(
  (result, rule) => {
    result.levels[rule.level] += 1;
    result.categories[rule.category] += 1;
    return result;
  },
  {
    levels: { N5: 0, N4: 0 },
    categories: { verb: 0, "i-adjective": 0, "na-adjective": 0, noun: 0 },
  },
);

if (errors.length > 0) {
  console.error("Conjugation data check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Conjugation data check passed.");
if (warnings.length > 0) {
  console.warn("Conjugation data warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
console.log(`Total: ${conjugationRules.length}`);
console.log(`N5: ${counts.levels.N5}`);
console.log(`N4: ${counts.levels.N4}`);
console.log(`Verb: ${counts.categories.verb}`);
console.log(`I-adjective: ${counts.categories["i-adjective"]}`);
console.log(`Na-adjective: ${counts.categories["na-adjective"]}`);
console.log(`Noun: ${counts.categories.noun}`);
