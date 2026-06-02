import { AppShell } from "@/components/AppShell";
import { ConjugationExamRunner } from "@/components/ConjugationExamRunner";
import { conjugationRules } from "@/data/conjugation";

export default function ConjugationExamPage() {
  return (
    <AppShell
      title="Conjugation Exam 活用測驗"
      description="Practice verb and adjective forms with 20 questions. 題目使用 curated learning sample conjugation data。"
    >
      <ConjugationExamRunner conjugationRules={conjugationRules} />
    </AppShell>
  );
}
