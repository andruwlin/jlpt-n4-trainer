import { AppShell } from "@/components/AppShell";
import { ConjugationBrowser } from "@/components/ConjugationBrowser";
import { conjugationRules } from "@/data/conjugation";

export default function ConjugationPage() {
  return (
    <AppShell
      title="詞性變化 Conjugation"
      description="學習 N5 / N4 常見動詞、形容詞、名詞變化。內容是 curated learning sample，不是官方完整清單。"
    >
      <ConjugationBrowser rules={conjugationRules} />
    </AppShell>
  );
}
