import { grammarPoints } from "../src/data/grammar";
import type { GrammarPoint } from "../src/data/grammar";

const allowedLevels = new Set(["N5", "N4"]);
const requiredStringFields = [
  "id",
  "level",
  "pattern",
  "meaningZh",
  "explanationZh",
  "structure",
  "exampleJa",
  "exampleZh",
] satisfies Array<keyof GrammarPoint>;

const errors: string[] = [];
const warnings: string[] = [];
const seenIds = new Map<string, number>();
const seenPatterns = new Map<string, string>();
const seenExamples = new Map<string, string>();
const meaningCounts = new Map<string, number>();

grammarPoints.forEach((grammar, index) => {
  const label = grammar.id || `grammar at index ${index}`;

  for (const field of requiredStringFields) {
    const value = grammar[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${label}: missing required field "${field}"`);
    }
  }

  if (!allowedLevels.has(grammar.level)) {
    errors.push(`${label}: invalid level "${grammar.level}"`);
  }

  if (!Array.isArray(grammar.tags) || grammar.tags.length === 0) {
    errors.push(`${label}: tags must be a non-empty array`);
  }

  if (grammar.id) {
    const previousIndex = seenIds.get(grammar.id);
    if (previousIndex !== undefined) {
      errors.push(`${label}: duplicate id also used at index ${previousIndex}`);
    }
    seenIds.set(grammar.id, index);
  }

  const patternKey = grammar.pattern.trim();
  const previousId = seenPatterns.get(patternKey);
  if (previousId) {
    errors.push(`${label}: duplicate pattern also used by ${previousId}`);
  }
  seenPatterns.set(patternKey, label);

  const exampleKey = grammar.exampleJa.trim();
  const previousExampleId = seenExamples.get(exampleKey);
  if (exampleKey && previousExampleId) {
    warnings.push(`${label}: repeated exampleJa also used by ${previousExampleId}`);
  }
  seenExamples.set(exampleKey, label);

  const meaningKey = grammar.meaningZh.trim();
  if (meaningKey) {
    meaningCounts.set(meaningKey, (meaningCounts.get(meaningKey) ?? 0) + 1);
  }
});

for (const [meaning, count] of meaningCounts) {
  if (count >= 5) {
    warnings.push(`meaningZh "${meaning}" appears ${count} times; review for overly similar grammar points`);
  }
}

const counts = grammarPoints.reduce(
  (result, grammar) => {
    if (grammar.level === "N5") {
      result.N5 += 1;
    }
    if (grammar.level === "N4") {
      result.N4 += 1;
    }
    return result;
  },
  { N5: 0, N4: 0 },
);

if (errors.length > 0) {
  console.error("Grammar data check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Grammar data check passed.");
if (warnings.length > 0) {
  console.warn("Grammar data warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
console.log(`Total: ${grammarPoints.length}`);
console.log(`N5: ${counts.N5}`);
console.log(`N4: ${counts.N4}`);
