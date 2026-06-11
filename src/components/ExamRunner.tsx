"use client";

import { ExamCard } from "@/components/ExamCard";
import { ExamSetup } from "@/components/ExamSetup";
import { StatPill } from "@/components/StatPill";
import type { JLPTWord } from "@/data/words";
import {
  generateExamSession,
  type ExamLevel,
  type ExamMode,
  type ExamQuestion,
} from "@/lib/exam";
import { getRecentlySeenSourceIds, recordRecentlySeen, recordWeakItem, saveExamResult } from "@/lib/progress";
import { useState } from "react";

type ExamRunnerProps = {
  words: JLPTWord[];
};

export function ExamRunner({ words }: ExamRunnerProps) {
  const [level, setLevel] = useState<ExamLevel>("N5");
  const [mode, setMode] = useState<ExamMode>("meaning-choice");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  function startExam() {
    const nextQuestions = generateExamSession({
      words,
      selectedLevel: level,
      selectedQuestionType: mode,
      questionCount: 20,
      recentlySeenSourceIds: getRecentlySeenSourceIds("vocabulary"),
    });

    setQuestions(nextQuestions);
    setAnsweredCount(0);
    setCorrectCount(0);
    setCurrentIndex(0);
    setSelectedAnswer(undefined);
    setIsFinished(nextQuestions.length === 0);
  }

  function answerQuestion(answer: string) {
    if (!question || selectedAnswer) {
      return;
    }

    setSelectedAnswer(answer);
    recordRecentlySeen({ kind: "vocabulary", sourceId: question.word.id });
    setAnsweredCount((count) => count + 1);
    if (answer === question.answer) {
      setCorrectCount((count) => count + 1);
    } else {
      recordWeakItem({
        kind: "vocabulary",
        sourceId: question.word.id,
        label: question.word.kanji ? `${question.word.kanji}（${question.word.kana}）` : question.word.kana,
        level: question.word.level,
      });
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= totalQuestions) {
      saveExamResult({
        id: `vocabulary-${Date.now()}`,
        kind: "vocabulary",
        level,
        questionType: mode,
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
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(undefined);
    setAnsweredCount(0);
    setCorrectCount(0);
    setIsFinished(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <ExamSetup
          level={level}
          mode={mode}
          onLevelChange={setLevel}
          onModeChange={setMode}
          onStart={startExam}
        />
        <section className="rounded-lg border border-white/80 bg-white/75 p-4 shadow-card">
          <p className="mb-3 text-sm font-bold text-ink">Session</p>
          <div className="flex flex-wrap gap-2">
            <StatPill label="進度" value={totalQuestions ? `${Math.min(currentIndex + 1, totalQuestions)} / ${totalQuestions}` : "0 / 20"} />
            <StatPill label="答對" value={correctCount} />
            <StatPill label="正確率" value={`${accuracy}%`} />
          </div>
        </section>
      </div>

      {isFinished && totalQuestions > 0 ? (
        <section className="rounded-lg border border-white/80 bg-white/90 p-5 text-center shadow-card sm:p-7">
          <p className="text-sm font-bold text-matcha">Result Summary</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">練習完成</h2>
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={startExam}
              className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white"
            >
              重新開始
            </button>
            <button
              type="button"
              onClick={returnToSetup}
              className="rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink"
            >
              回 Exam Setup
            </button>
          </div>
        </section>
      ) : question ? (
        <ExamCard
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
          <h2 className="mt-2 text-2xl font-bold text-ink">選擇設定後開始練習</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            本次 session 的題數、答對數與正確率只存在目前頁面的 React state。
          </p>
        </section>
      )}
    </div>
  );
}
