import { AppShell } from "@/components/AppShell";
import { VocabularyBrowser } from "@/components/VocabularyBrowser";
import { words } from "@/data/words";

export default function VocabularyPage() {
  return (
    <AppShell
      title="Vocabulary"
      description="篩選 N5 / N4 curated sample bank，搜尋假名、漢字或中文意思。"
    >
      <VocabularyBrowser words={words} />
    </AppShell>
  );
}
