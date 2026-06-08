import { AppShell } from "@/components/AppShell";
import { DailyPracticeRunner } from "@/components/DailyPracticeRunner";
import { conjugationRules } from "@/data/conjugation";
import { grammarPoints } from "@/data/grammar";
import { words } from "@/data/words";

export default function DailyPracticePage() {
  return (
    <AppShell
      title="Daily Practice 每日練習"
      description="20-question mixed practice with weak items, vocabulary, grammar, and conjugation."
    >
      <DailyPracticeRunner words={words} grammarPoints={grammarPoints} conjugationRules={conjugationRules} />
    </AppShell>
  );
}
