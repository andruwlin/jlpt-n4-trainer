"use client";

import { useMemo, useState } from "react";
import { ExamCard } from "@/components/ExamCard";
import { ExamSetup } from "@/components/ExamSetup";
import { StatPill } from "@/components/StatPill";
import type { JLPTWord } from "@/data/words";
import { buildQuestion, getWordsForLevel, type ExamLevel, type ExamMode, type ExamQuestion } from "@/lib/exam";

type ExamRunnerProps = {
  words: JLPTWord[];
};

export function ExamRunner({ words }: ExamRunnerProps) {
  const [level, setLevel] = useState<ExamLevel>("N5");
  const [mode, setMode] = useState<ExamMode>("meaning-choice");
  const [question, setQuestion] = useState<ExamQuestion>();
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const pool = useMemo(() => getWordsForLevel(words, level), [level, words]);
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  function startExam() {
    setAnsweredCount(0);
    setCorrectCount(0);
    setQuestionIndex(1);
    setSelectedAnswer(undefined);
    setQuestion(buildQuestion(pool, mode, 1));
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
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setSelectedAnswer(undefined);
    setQuestion(buildQuestion(pool, mode, nextIndex));
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
            <StatPill label="題數" value={answeredCount} />
            <StatPill label="答對" value={correctCount} />
            <StatPill label="正確率" value={`${accuracy}%`} />
          </div>
        </section>
      </div>

      {question ? (
        <ExamCard
          key={question.id}
          question={question}
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
