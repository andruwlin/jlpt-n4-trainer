import { AppShell } from "@/components/AppShell";
import { GrammarExamRunner } from "@/components/GrammarExamRunner";
import { grammarPoints } from "@/data/grammar";

export default function GrammarExamPage() {
  return (
    <AppShell
      title="Grammar Exam 文法測驗"
      description="Practice grammar patterns with 20 questions. 題目使用 curated learning sample grammar data。"
    >
      <GrammarExamRunner grammarPoints={grammarPoints} />
    </AppShell>
  );
}
