"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewSetup } from "@/components/ReviewSetup";
import { StatPill } from "@/components/StatPill";
import type { ReviewDataBanks, ReviewKindFilter, ReviewQuestion, ReviewScope } from "@/lib/review";
import {
  generateReviewSession,
  getReviewableWeakItems,
  REVIEW_QUESTION_LIMIT,
} from "@/lib/review";
import {
  getProgress,
  getRecentlySeen,
  getReviewStats,
  recordRecentlySeen,
  recordWeakItemReview,
  type LearningProgressState,
} from "@/lib/progress";

type ReviewRunnerProps = {
  dataBanks: ReviewDataBanks;
};

const emptyProgress: LearningProgressState = {
  version: 1,
  results: [],
  weakItems: [],
  recentlySeen: [],
};

export function ReviewRunner({ dataBanks }: ReviewRunnerProps) {
  const [progress, setProgress] = useState<LearningProgressState>(emptyProgress);
  const [kind, setKind] = useState<ReviewKindFilter>("all");
  const [scope, setScope] = useState<ReviewScope>("due");
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
    if (new URLSearchParams(window.location.search).get("scope") === "all") {
      setScope("all");
    }
  }, []);

  const reviewStats = useMemo(() => getReviewStats(progress), [progress]);
  const reviewableWeakItems = useMemo(() => getReviewableWeakItems(progress, kind, scope), [progress, kind, scope]);
  const previewQuestions = useMemo(
    () =>
      generateReviewSession({
        weakItems: progress.weakItems,
        dataBanks,
        kind,
        scope,
        questionLimit: REVIEW_QUESTION_LIMIT,
        recentlySeenSourceIds: getRecentlySeen().map((item) => item.sourceId),
      }),
    [dataBanks, kind, progress.weakItems, scope],
  );

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  function startReview() {
    const nextQuestions = generateReviewSession({
      weakItems: progress.weakItems,
      dataBanks,
      kind,
      scope,
      questionLimit: REVIEW_QUESTION_LIMIT,
      recentlySeenSourceIds: getRecentlySeen().map((item) => item.sourceId),
    });

    setQuestions(nextQuestions);
    setAnsweredCount(0);
    setCorrectCount(0);
    setCurrentIndex(0);
    setSelectedAnswer(undefined);
    setIsFinished(nextQuestions.length === 0);
    setHasStarted(true);
  }

  function answerQuestion(answer: string) {
    if (!question || selectedAnswer) {
      return;
    }

    setSelectedAnswer(answer);
    recordRecentlySeen({ kind: question.kind, sourceId: question.weakItem.sourceId });
    recordWeakItemReview(question.kind, question.weakItem.sourceId, answer === question.answer);
    setProgress(getProgress());
    setAnsweredCount((count) => count + 1);
    if (answer === question.answer) {
      setCorrectCount((count) => count + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= totalQuestions) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(undefined);
  }

  function returnToSetup() {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(undefined);
    setAnsweredCount(0);
    setCorrectCount(0);
    setIsFinished(false);
    setHasStarted(false);
  }

  if (progress.weakItems.length === 0) {
    return <ReviewEmptyState />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <ReviewSetup
          kind={kind}
          scope={scope}
          totalWeakItems={progress.weakItems.length}
          dueWeakItems={reviewStats.dueCount}
          availableQuestions={previewQuestions.length}
          questionLimit={REVIEW_QUESTION_LIMIT}
          onKindChange={setKind}
          onScopeChange={setScope}
          onStart={startReview}
        />
        <section className="rounded-lg border border-white/80 bg-white/75 p-4 shadow-card">
          <p className="mb-3 text-sm font-bold text-ink">Review Session</p>
          <div className="flex flex-wrap gap-2">
            <StatPill
              label="進度"
              value={totalQuestions ? `${Math.min(currentIndex + 1, totalQuestions)} / ${totalQuestions}` : "0 / 0"}
            />
            <StatPill label="可重練" value={reviewableWeakItems.length} />
            <StatPill label="到期" value={reviewStats.dueCount} />
            <StatPill label="答對" value={correctCount} />
            <StatPill label="正確率" value={`${accuracy}%`} />
          </div>
        </section>
      </div>

      {isFinished && totalQuestions > 0 ? (
        <ReviewResultSummary
          totalQuestions={totalQuestions}
          correctCount={correctCount}
          wrongCount={wrongCount}
          accuracy={accuracy}
          onRestart={startReview}
          onBackToSetup={returnToSetup}
        />
      ) : question ? (
        <ReviewCard
          key={question.id}
          question={question}
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          isLastQuestion={currentIndex + 1 >= totalQuestions}
          selectedAnswer={selectedAnswer}
          onAnswer={answerQuestion}
          onNext={nextQuestion}
        />
      ) : hasStarted ? (
        <section className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-6 text-center shadow-card">
          <p className="text-sm font-bold text-matcha">No Reviewable Items</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">這個篩選目前沒有可產生的題目</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            有些錯題可能已經找不到原始資料，或同類選項不足四個，因此會安全略過。
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-6 text-center shadow-card">
          <p className="text-sm font-bold text-matcha">Ready</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">選擇分類後開始錯題重練</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Review queue 會在開始時固定產生，不會強制 20 題。
          </p>
        </section>
      )}
    </div>
  );
}

function ReviewEmptyState() {
  return (
    <section className="rounded-lg border border-matcha/20 bg-white/90 p-5 shadow-card sm:p-7">
      <p className="text-sm font-bold text-matcha">No weak items</p>
      <h2 className="mt-2 text-3xl font-bold leading-tight text-ink">目前沒有錯題可以重練</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        完成測驗並答錯題目後，錯題會儲存在這台裝置的瀏覽器，之後可以回到這裡重練。
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="rounded-lg bg-ink px-4 py-3 text-center text-sm font-bold text-white" href="/dashboard">
          回 Dashboard
        </Link>
        <Link className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-center text-sm font-bold text-ink" href="/exam">
          Vocabulary Exam
        </Link>
        <Link className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-center text-sm font-bold text-ink" href="/grammar-exam">
          Grammar Exam
        </Link>
        <Link className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-center text-sm font-bold text-ink" href="/conjugation-exam">
          Conjugation Exam
        </Link>
      </div>
    </section>
  );
}

function ReviewResultSummary({
  totalQuestions,
  correctCount,
  wrongCount,
  accuracy,
  onRestart,
  onBackToSetup,
}: {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  onRestart: () => void;
  onBackToSetup: () => void;
}) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/90 p-5 text-center shadow-card sm:p-7">
      <p className="text-sm font-bold text-matcha">Review Result Summary</p>
      <h2 className="mt-2 text-3xl font-bold text-ink">錯題重練完成</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-paper p-4">
          <p className="text-2xl font-bold text-ink">{totalQuestions}</p>
          <p className="text-xs font-bold text-ink/55">總題數</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-2xl font-bold text-matcha">{correctCount}</p>
          <p className="text-xs font-bold text-ink/55">答對</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-2xl font-bold text-red-700">{wrongCount}</p>
          <p className="text-xs font-bold text-ink/55">答錯</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-2xl font-bold text-ink">{accuracy}%</p>
          <p className="text-xs font-bold text-ink/55">正確率</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={onRestart} className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white">
          Review again
        </button>
        <button
          type="button"
          onClick={onBackToSetup}
          className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink"
        >
          Back to setup
        </button>
        <Link className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>
      <Link className="mt-3 inline-flex text-sm font-bold text-matcha" href="/">
        Back Home
      </Link>
    </section>
  );
}
