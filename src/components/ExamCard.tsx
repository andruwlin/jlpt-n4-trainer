"use client";

import { speakJapanese } from "@/lib/speech";
import type { ExamQuestion } from "@/lib/exam";

type ExamCardProps = {
  question: ExamQuestion;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
};

export function ExamCard({ question, selectedAnswer, onAnswer, onNext }: ExamCardProps) {
  const answered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === question.answer;

  return (
    <section className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-bold text-ink">
          {question.type === "meaning-choice" ? "中文意思" : "日文填空"}
        </span>
        <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
          {question.word.level}
        </span>
      </div>

      {question.type === "meaning-choice" ? (
        <>
          <p className="text-sm font-bold text-ink/55">這個單字的中文意思是？</p>
          <h2 className="mt-2 break-words text-3xl font-bold leading-tight text-ink">
            {question.prompt}
          </h2>
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-ink/55">選出適合放入空格的日文</p>
          <h2 className="mt-2 break-words text-2xl font-bold leading-relaxed text-ink">
            {question.blankSentence}
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">提示：{question.prompt}</p>
        </>
      )}

      <div className="mt-5 grid gap-3">
        {question.choices.map((choice) => {
          const active = selectedAnswer === choice;
          const correct = answered && choice === question.answer;
          const wrong = answered && active && choice !== question.answer;

          return (
            <button
              key={choice}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(choice)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-bold leading-6 transition ${
                correct
                  ? "border-matcha bg-matcha/15 text-matcha"
                  : wrong
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-ink/10 bg-paper text-ink hover:bg-sakura/20"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="mt-5 rounded-lg bg-paper p-4">
          <p className={`text-sm font-bold ${isCorrect ? "text-matcha" : "text-red-700"}`}>
            {isCorrect ? "Correct" : "Incorrect"}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink">
            正確答案：<span className="font-bold">{question.answer}</span>
          </p>
          {question.type === "sentence-fill" ? (
            <>
              <p className="mt-2 break-words text-sm font-bold leading-6 text-ink">
                {question.word.exampleJa}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/65">{question.word.exampleZh}</p>
              <button
                type="button"
                onClick={() => speakJapanese(question.word.exampleJa)}
                className="mt-3 rounded-full border border-matcha/30 bg-white px-4 py-2 text-sm font-bold text-matcha"
              >
                朗讀完整例句
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onNext}
            className="mt-4 w-full rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white"
          >
            下一題
          </button>
        </div>
      ) : null}
    </section>
  );
}
