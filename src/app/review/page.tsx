import { AppShell } from "@/components/AppShell";
import { ReviewRunner } from "@/components/ReviewRunner";
import { conjugationRules } from "@/data/conjugation";
import { grammarPoints } from "@/data/grammar";
import { words } from "@/data/words";

export default function ReviewPage() {
  return (
    <AppShell
      title="Review 錯題重練"
      description="Use local weak items from this browser to review Vocabulary, Grammar, and Conjugation mistakes."
    >
      <ReviewRunner dataBanks={{ words, grammarPoints, conjugationRules }} />
    </AppShell>
  );
}
