"use client";

import { speakJapanese } from "@/lib/speech";
import type { ExamQuestion } from "@/lib/exam";

type ExamCardProps = {
  question: ExamQuestion;
  currentQuestion: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
};

export function ExamCard({
  question,
  currentQuestion,
  totalQuestions,
  isLastQuestion,
  selectedAnswer,
  onAnswer,
  onNext,
}: ExamCardProps) {
  const answered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === question.answer;
  const progressPercent = totalQuestions === 0 ? 0 : (currentQuestion / totalQuestions) * 100;

  return (
    <section className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-card sm:p-6">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-ink/60">
          <span>
            Question {currentQuestion} / {totalQuestions}
          </span>
          <span>{question.type === "meaning-choice" ? "中文意思" : "單字原形辨識"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-matcha" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-bold text-ink">
          {question.type === "meaning-choice" ? "中文意思" : "Word in Example"}
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
          <p className="text-sm font-bold text-ink/55">選出這個例句中使用的單字原形</p>
          <p className="mt-1 text-xs font-bold leading-5 text-ink/45">
            請看日文例句，選出句中使用的單字。選項以辭書形表示。
            Choose the dictionary form of the word used in the example sentence.
          </p>
          <h2 className="mt-2 break-words text-2xl font-bold leading-relaxed text-ink">
            {question.blankSentence}
          </h2>
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
          <p className="mt-2 text-sm leading-6 text-ink">
            中文意思：<span className="font-bold">{question.word.meaningZh}</span>
          </p>
          <p className="mt-2 break-words text-sm font-bold leading-6 text-ink">
            {question.word.exampleJa}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink/65">{question.word.exampleZh}</p>
          {question.type === "sentence-fill" ? (
            <>
              <p className="mt-3 rounded-lg bg-white/75 px-3 py-3 text-sm leading-6 text-ink/70">
                {getWordInExampleNote(question)}
              </p>
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
            {isLastQuestion ? "查看結果" : "下一題"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function getWordInExampleNote(question: ExamQuestion) {
  const displayWord = question.word.kanji ?? question.word.kana;
  const surface = findExampleSurface(question.word.exampleJa, displayWord);

  if (surface && surface !== displayWord) {
    return `例句中使用的是「${surface}」，它的辭書形是「${displayWord}」。This sentence uses ${surface}; the dictionary form is ${displayWord}.`;
  }

  return `這題是在辨識例句中使用的單字原形，不是直接把選項填進句子。The answer is the dictionary form used in the example.`;
}

function findExampleSurface(exampleJa: string, dictionaryForm: string) {
  if (exampleJa.includes(dictionaryForm)) {
    return dictionaryForm;
  }

  for (let length = dictionaryForm.length - 1; length >= 2; length -= 1) {
    const candidate = dictionaryForm.slice(0, length);
    if (exampleJa.includes(candidate)) {
      return candidate;
    }
  }

  return undefined;
}
