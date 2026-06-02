"use client";

import Link from "next/link";
import { useState } from "react";
import { ConjugationExamCard } from "@/components/ConjugationExamCard";
import { ConjugationExamSetup } from "@/components/ConjugationExamSetup";
import { StatPill } from "@/components/StatPill";
import type { ConjugationRule } from "@/data/conjugation";
import {
  generateConjugationExamSession,
  type ConjugationExamCategory,
  type ConjugationExamLevel,
  type ConjugationExamMode,
  type ConjugationExamQuestion,
} from "@/lib/conjugationExam";

type ConjugationExamRunnerProps = {
  conjugationRules: ConjugationRule[];
};

export function ConjugationExamRunner({ conjugationRules }: ConjugationExamRunnerProps) {
  const [level, setLevel] = useState<ConjugationExamLevel>("N5");
  const [category, setCategory] = useState<ConjugationExamCategory>("all");
  const [mode, setMode] = useState<ConjugationExamMode>("result-choice");
  const [questions, setQuestions] = useState<ConjugationExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("");

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  function startExam() {
    const nextQuestions = generateConjugationExamSession({
      conjugationRules,
      selectedLevel: level,
      selectedCategory: category,
      selectedQuestionType: mode,
      questionCount: 20,
    });

    setQuestions(nextQuestions);
    setAnsweredCount(0);
    setCorrectCount(0);
    setCurrentIndex(0);
    setSelectedAnswer(undefined);
    setIsFinished(false);
    setEmptyMessage(
      nextQuestions.length === 0
        ? "目前這個 level / category / 題型組合沒有足夠的 4 選 1 選項，請換一個設定。"
        : "",
    );
  }

  function answerQuestion(answer: string) {
    if (!question || selectedAnswer) {
      return;
    }

    setSelectedAnswer(answer);
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
    setEmptyMessage("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <ConjugationExamSetup
          level={level}
          category={category}
          mode={mode}
          onLevelChange={setLevel}
          onCategoryChange={setCategory}
          onModeChange={setMode}
          onStart={startExam}
        />
        <section className="rounded-lg border border-white/80 bg-white/75 p-4 shadow-card">
          <p className="mb-3 text-sm font-bold text-ink">Session</p>
          <div className="flex flex-wrap gap-2">
            <StatPill
              label="進度"
              value={totalQuestions ? `${Math.min(currentIndex + 1, totalQuestions)} / ${totalQuestions}` : "0 / 20"}
            />
            <StatPill label="答對" value={correctCount} />
            <StatPill label="正確率" value={`${accuracy}%`} />
          </div>
        </section>
      </div>

      {isFinished && totalQuestions > 0 ? (
        <section className="rounded-lg border border-white/80 bg-white/90 p-5 text-center shadow-card sm:p-7">
          <p className="text-sm font-bold text-matcha">Result Summary</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">活用測驗完成</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-paper p-4">
              <p className="text-2xl font-bold text-ink">{totalQuestions}</p>
              <p className="text-xs font-bold text-ink/55">Total</p>
            </div>
            <div className="rounded-lg bg-paper p-4">
              <p className="text-2xl font-bold text-matcha">{correctCount}</p>
              <p className="text-xs font-bold text-ink/55">Correct</p>
            </div>
            <div className="rounded-lg bg-paper p-4">
              <p className="text-2xl font-bold text-red-700">{wrongCount}</p>
              <p className="text-xs font-bold text-ink/55">Incorrect</p>
            </div>
            <div className="rounded-lg bg-paper p-4">
              <p className="text-2xl font-bold text-ink">{accuracy}%</p>
              <p className="text-xs font-bold text-ink/55">Accuracy</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={startExam}
              className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white"
            >
              Restart
            </button>
            <button
              type="button"
              onClick={returnToSetup}
              className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink"
            >
              Back to Setup
            </button>
            <Link
              href="/"
              className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink"
            >
              Back Home
            </Link>
          </div>
        </section>
      ) : question ? (
        <ConjugationExamCard
          key={question.id}
          question={question}
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          isLastQuestion={currentIndex + 1 >= totalQuestions}
          selectedAnswer={selectedAnswer}
          onAnswer={answerQuestion}
          onNext={nextQuestion}
        />
      ) : (
        <section className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-6 text-center shadow-card">
          <p className="text-sm font-bold text-matcha">Ready</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">選擇設定後開始活用測驗</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Conjugation Exam 使用 curated sample conjugation data，每次最多固定 20 題。
          </p>
          {emptyMessage ? <p className="mt-4 text-sm font-bold leading-6 text-red-700">{emptyMessage}</p> : null}
        </section>
      )}
    </div>
  );
}
