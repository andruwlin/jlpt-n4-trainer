"use client";

import { speakJapanese } from "@/lib/speech";
import type { GrammarExamQuestion } from "@/lib/grammarExam";

type GrammarExamCardProps = {
  question: GrammarExamQuestion;
  currentQuestion: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
};

export function GrammarExamCard({
  question,
  currentQuestion,
  totalQuestions,
  isLastQuestion,
  selectedAnswer,
  onAnswer,
  onNext,
}: GrammarExamCardProps) {
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
          <span>{question.type === "meaning-choice" ? "中文意思" : "句子填空"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-matcha" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-bold text-ink">
          {question.type === "meaning-choice" ? "中文意思" : "句子填空"}
        </span>
        <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
          {question.grammar.level}
        </span>
      </div>

      {question.type === "meaning-choice" ? (
        <>
          <p className="text-sm font-bold text-ink/55">選出這個文法在句中的主要意思</p>
          <p className="mt-1 text-xs font-bold leading-5 text-ink/45">
            Choose the main meaning of this grammar pattern.
          </p>
          <h2 className="mt-2 break-words text-3xl font-bold leading-tight text-ink">
            {question.grammar.pattern}
          </h2>
          <div className="mt-4 rounded-lg bg-paper px-3 py-3">
            <p className="text-xs font-bold text-ink/50">接續 / 結構</p>
            <p className="mt-1 break-words text-sm font-bold leading-6 text-ink">
              {question.grammar.structure}
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="text-base font-bold leading-6 text-ink">{question.questionText}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-ink/50">
            請注意空格前後的日文接續，不只看中文意思。Choose the grammar that makes the whole Japanese
            sentence natural.
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
            中文意思：<span className="font-bold">{question.grammar.meaningZh}</span>
          </p>
          <div className="mt-3 rounded-lg bg-white/75 px-3 py-3">
            <p className="text-xs font-bold text-matcha">為什麼是這個答案？ / Why this answer?</p>
            <p className="mt-2 text-sm leading-6 text-ink/75">{question.grammar.explanationZh}</p>
            {getGrammarConnectionNote(question) ? (
              <p className="mt-2 text-sm leading-6 text-ink/65">{getGrammarConnectionNote(question)}</p>
            ) : null}
          </div>
          <p className="mt-3 break-words text-sm font-bold leading-6 text-ink">
            {question.grammar.exampleJa}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink/65">{question.grammar.exampleZh}</p>
          <button
            type="button"
            onClick={() => speakJapanese(question.grammar.exampleJa)}
            className="mt-3 rounded-full border border-matcha/30 bg-white px-4 py-2 text-sm font-bold text-matcha"
          >
            朗讀完整例句
          </button>
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

function getGrammarConnectionNote(question: GrammarExamQuestion) {
  const normalizedPattern = question.grammar.pattern.replace(/（.+?）/g, "").trim();

  if (question.type !== "sentence-fill") {
    return undefined;
  }

  if (normalizedPattern === "ば" || normalizedPattern.includes("〜ば")) {
    return "接續提示：「ば」常接在條件形後，例如 ある → あれば。「ので」通常接在普通形或丁寧形後，例如 あるので，不是 あれので。";
  }

  return "接續提示：這題要看空格前後的日文接續，補上後整句必須自然。Pay attention to the connection before and after the blank.";
}
