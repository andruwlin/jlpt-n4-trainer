"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DailyPracticeCard } from "@/components/DailyPracticeCard";
import { DailyPracticeSetup } from "@/components/DailyPracticeSetup";
import { StatPill } from "@/components/StatPill";
import type { ConjugationRule } from "@/data/conjugation";
import type { GrammarPoint } from "@/data/grammar";
import type { JLPTWord } from "@/data/words";
import {
  generateDailyPracticeSession,
  type DailyPracticeLevel,
  type DailyPracticeQuestion,
} from "@/lib/dailyPractice";
import {
  getProgress,
  getRecentlySeen,
  recordRecentlySeen,
  recordWeakItem,
  saveExamResult,
  type WeakItemRecord,
} from "@/lib/progress";

type DailyPracticeRunnerProps = {
  words: JLPTWord[];
  grammarPoints: GrammarPoint[];
  conjugationRules: ConjugationRule[];
};

export function DailyPracticeRunner({ words, grammarPoints, conjugationRules }: DailyPracticeRunnerProps) {
  const [level, setLevel] = useState<DailyPracticeLevel>("Mixed");
  const [weakItems, setWeakItems] = useState<WeakItemRecord[]>([]);
  const [questions, setQuestions] = useState<DailyPracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setWeakItems(getProgress().weakItems);
  }, []);

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);
  const weakQuestionCount = questions.filter((item) => item.isWeakItem).length;

  function startPractice() {
    const latestWeakItems = getProgress().weakItems;
    const nextQuestions = generateDailyPracticeSession({
      level,
      words,
      grammarPoints,
      conjugationRules,
      weakItems: latestWeakItems,
      questionCount: 20,
      recentlySeenSourceIds: getRecentlySeen().map((item) => item.sourceId),
    });

    setWeakItems(latestWeakItems);
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
    recordDailyRecentlySeen(question);
    setAnsweredCount((count) => count + 1);
    if (answer === question.answer) {
      setCorrectCount((count) => count + 1);
      return;
    }

    recordDailyWeakItem(question);
  }

  function nextQuestion() {
    if (currentIndex + 1 >= totalQuestions) {
      saveExamResult({
        id: `daily-${Date.now()}`,
        kind: "daily",
        level,
        questionType: "daily-practice",
        total: totalQuestions,
        correct: correctCount,
        incorrect: wrongCount,
        accuracy,
        completedAt: new Date().toISOString(),
      });
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(undefined);
  }

  function returnToSetup() {
    setWeakItems(getProgress().weakItems);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(undefined);
    setAnsweredCount(0);
    setCorrectCount(0);
    setIsFinished(false);
    setHasStarted(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <DailyPracticeSetup
          level={level}
          weakItemCount={weakItems.length}
          onLevelChange={setLevel}
          onStart={startPractice}
        />
        <section className="rounded-lg border border-white/80 bg-white/75 p-4 shadow-card">
          <p className="mb-3 text-sm font-bold text-ink">Daily Session</p>
          <div className="flex flex-wrap gap-2">
            <StatPill
              label="進度"
              value={totalQuestions ? `${Math.min(currentIndex + 1, totalQuestions)} / ${totalQuestions}` : "0 / 20"}
            />
            <StatPill label="錯題優先" value={weakQuestionCount} />
            <StatPill label="答對" value={correctCount} />
            <StatPill label="正確率" value={`${accuracy}%`} />
          </div>
        </section>
      </div>

      {isFinished && totalQuestions > 0 ? (
        <DailyResultSummary
          totalQuestions={totalQuestions}
          correctCount={correctCount}
          wrongCount={wrongCount}
          accuracy={accuracy}
          onRestart={startPractice}
          onBackToSetup={returnToSetup}
        />
      ) : question ? (
        <DailyPracticeCard
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
          <p className="text-sm font-bold text-matcha">No Questions</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">目前資料不足以產生練習</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">請換 Mixed 或稍後擴充資料後再試。</p>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-6 text-center shadow-card">
          <p className="text-sm font-bold text-matcha">Ready</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">開始今天的 20 題</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Queue 會在開始時固定產生，包含錯題、單字、文法與活用。
          </p>
        </section>
      )}
    </div>
  );
}

function recordDailyWeakItem(question: DailyPracticeQuestion) {
  if (question.kind === "vocabulary") {
    recordWeakItem({
      kind: "vocabulary",
      sourceId: question.word.id,
      label: question.word.kanji ? `${question.word.kanji}（${question.word.kana}）` : question.word.kana,
      level: question.word.level,
    });
    return;
  }

  if (question.kind === "grammar") {
    recordWeakItem({
      kind: "grammar",
      sourceId: question.grammar.id,
      label: question.grammar.pattern,
      level: question.grammar.level,
    });
    return;
  }

  recordWeakItem({
    kind: "conjugation",
    sourceId: question.sourceId,
    label: `${question.example.base} → ${question.example.result} / ${question.rule.title}`,
    level: question.rule.level,
  });
}

function recordDailyRecentlySeen(question: DailyPracticeQuestion) {
  if (question.kind === "vocabulary") {
    recordRecentlySeen({ kind: "vocabulary", sourceId: question.word.id });
    return;
  }

  if (question.kind === "grammar") {
    recordRecentlySeen({ kind: "grammar", sourceId: question.grammar.id });
    return;
  }

  recordRecentlySeen({ kind: "conjugation", sourceId: question.sourceId });
}

function DailyResultSummary({
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
      <p className="text-sm font-bold text-matcha">Daily Result Summary</p>
      <h2 className="mt-2 text-3xl font-bold text-ink">每日練習完成</h2>
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
          Practice again
        </button>
        <Link className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink" href="/dashboard">
          Back Dashboard
        </Link>
        <Link className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink" href="/">
          Back Home
        </Link>
      </div>
      <button type="button" onClick={onBackToSetup} className="mt-3 text-sm font-bold text-matcha">
        Back to setup
      </button>
    </section>
  );
}
