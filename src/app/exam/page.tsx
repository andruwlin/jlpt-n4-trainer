import { AppShell } from "@/components/AppShell";
import { ExamRunner } from "@/components/ExamRunner";
import { words } from "@/data/words";

export default function ExamPage() {
  return (
    <AppShell
      title="Exam 練習"
      description="選擇 level 與題型，練習中文意思選擇題或日文句子填空題。"
    >
      <ExamRunner words={words} />
    </AppShell>
  );
}
