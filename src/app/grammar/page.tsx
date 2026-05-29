import { AppShell } from "@/components/AppShell";
import { GrammarBrowser } from "@/components/GrammarBrowser";
import { grammarPoints } from "@/data/grammar";

export default function GrammarPage() {
  return (
    <AppShell
      title="文法教學 Grammar"
      description="瀏覽 N5 / N4 curated sample grammar patterns，搭配簡短說明與自然例句。"
    >
      <GrammarBrowser grammarPoints={grammarPoints} />
    </AppShell>
  );
}
