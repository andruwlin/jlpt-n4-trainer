import { words } from "../src/data/words";
import type { JLPTWord } from "../src/data/words";

const allowedLevels = new Set(["N5", "N4"]);
const requiredStringFields = [
  "id",
  "level",
  "kana",
  "meaningZh",
  "partOfSpeech",
  "exampleJa",
  "exampleZh",
] satisfies Array<keyof JLPTWord>;

const errors: string[] = [];
const warnings: string[] = [];
const seenIds = new Map<string, number>();
const seenWordKeys = new Map<string, string>();
const seenExamples = new Map<string, string>();
const meaningCounts = new Map<string, number>();

words.forEach((word, index) => {
  const label = word.id || `word at index ${index}`;

  for (const field of requiredStringFields) {
    const value = word[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${label}: missing required field "${field}"`);
    }
  }

  if (!allowedLevels.has(word.level)) {
    errors.push(`${label}: invalid level "${word.level}"`);
  }

  if (!Array.isArray(word.tags) || word.tags.length === 0) {
    errors.push(`${label}: tags must be a non-empty array`);
  }

  if (word.id) {
    const previousIndex = seenIds.get(word.id);
    if (previousIndex !== undefined) {
      errors.push(`${label}: duplicate id also used at index ${previousIndex}`);
    }
    seenIds.set(word.id, index);
  }

  const wordKey = `${word.kana.trim()}::${word.kanji?.trim() ?? ""}`;
  const previousId = seenWordKeys.get(wordKey);
  if (previousId) {
    errors.push(`${label}: duplicate kana + kanji pair also used by ${previousId}`);
  }
  seenWordKeys.set(wordKey, label);

  const exampleKey = word.exampleJa.trim();
  const previousExampleId = seenExamples.get(exampleKey);
  if (exampleKey && previousExampleId) {
    warnings.push(`${label}: repeated exampleJa also used by ${previousExampleId}`);
  }
  seenExamples.set(exampleKey, label);

  const meaningKey = word.meaningZh.trim();
  if (meaningKey) {
    meaningCounts.set(meaningKey, (meaningCounts.get(meaningKey) ?? 0) + 1);
  }
});

for (const [meaning, count] of meaningCounts) {
  if (count >= 12) {
    warnings.push(`meaningZh "${meaning}" appears ${count} times; review for overly similar entries`);
  }
}

const counts = words.reduce(
  (result, word) => {
    if (word.level === "N5") {
      result.N5 += 1;
    }
    if (word.level === "N4") {
      result.N4 += 1;
    }
    return result;
  },
  { N5: 0, N4: 0 },
);

if (errors.length > 0) {
  console.error("Word data check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Word data check passed.");
if (warnings.length > 0) {
  console.warn("Word data warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
console.log(`Total: ${words.length}`);
console.log(`N5: ${counts.N5}`);
console.log(`N4: ${counts.N4}`);
