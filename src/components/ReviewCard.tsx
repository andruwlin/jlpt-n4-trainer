"use client";

import { speakJapanese } from "@/lib/speech";
import type { ReviewQuestion } from "@/lib/review";

type ReviewCardProps = {
  question: ReviewQuestion;
  currentQuestion: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
};

const kindLabels: Record<ReviewQuestion["kind"], string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  conjugation: "Conjugation",
};

export function ReviewCard({
  question,
  currentQuestion,
  totalQuestions,
  isLastQuestion,
  selectedAnswer,
  onAnswer,
  onNext,
}: ReviewCardProps) {
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
          <span>{kindLabels[question.kind]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-matcha" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-sakura/25 px-3 py-1 text-xs font-bold text-ink">
          {kindLabels[question.kind]}
        </span>
        {"word" in question ? (
          <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
            {question.word.level}
          </span>
        ) : "grammar" in question ? (
          <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
            {question.grammar.level}
          </span>
        ) : (
          <span className="rounded-full bg-matcha/15 px-3 py-1 text-xs font-bold text-matcha">
            {question.rule.level}
          </span>
        )}
      </div>

      <QuestionPrompt question={question} />

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
        <AnswerDetail question={question} isCorrect={isCorrect} isLastQuestion={isLastQuestion} onNext={onNext} />
      ) : null}
    </section>
  );
}

function QuestionPrompt({ question }: { question: ReviewQuestion }) {
  if (question.kind === "vocabulary") {
    return (
      <>
        <p className="text-sm font-bold text-ink/55">這個單字的中文意思是？</p>
        <h2 className="mt-2 break-words text-3xl font-bold leading-tight text-ink">
          {question.word.kanji ? `${question.word.kanji}（${question.word.kana}）` : question.word.kana}
        </h2>
      </>
    );
  }

  if (question.kind === "grammar") {
    return (
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
          <p className="mt-1 break-words text-sm font-bold leading-6 text-ink">{question.grammar.structure}</p>
        </div>
      </>
    );
  }

  if (question.type === "result-choice") {
    return (
      <>
        <p className="text-sm font-bold text-ink/55">
          請把「{question.example.base}」變成「{question.rule.form}」
        </p>
        <p className="mt-1 text-xs font-bold leading-5 text-ink/45">
          Choose the correct conjugated form of “{question.example.base}”.
        </p>
        <h2 className="mt-2 break-words text-3xl font-bold leading-tight text-ink">
          {question.example.base} → ＿＿
        </h2>
        <p className="mt-1 text-sm font-bold leading-6 text-ink/70">{question.rule.title}</p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-bold text-ink/55">這是哪一種變化？</p>
      <p className="mt-1 text-xs font-bold leading-5 text-ink/45">
        Choose the form used in this change.
      </p>
      <h2 className="mt-2 break-words text-2xl font-bold leading-relaxed text-ink">
        {question.example.base} → {question.example.result}
      </h2>
    </>
  );
}

function AnswerDetail({
  question,
  isCorrect,
  isLastQuestion,
  onNext,
}: {
  question: ReviewQuestion;
  isCorrect: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
}) {
  const speechText =
    question.kind === "vocabulary"
      ? question.word.exampleJa
      : question.kind === "grammar"
        ? question.grammar.exampleJa
        : question.example.exampleJa ?? question.example.result;

  return (
    <div className="mt-5 rounded-lg bg-paper p-4">
      <p className={`text-sm font-bold ${isCorrect ? "text-matcha" : "text-red-700"}`}>
        {isCorrect ? "Correct" : "Incorrect"}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink">
        正確答案：<span className="font-bold">{question.answer}</span>
      </p>

      {question.kind === "vocabulary" ? (
        <>
          <p className="mt-3 break-words text-sm font-bold leading-6 text-ink">{question.word.exampleJa}</p>
          <p className="mt-1 text-sm leading-6 text-ink/65">{question.word.exampleZh}</p>
        </>
      ) : null}

      {question.kind === "grammar" ? (
        <>
          <p className="mt-2 text-sm leading-6 text-ink">
            中文意思：<span className="font-bold">{question.grammar.meaningZh}</span>
          </p>
          <div className="mt-3 rounded-lg bg-white/75 px-3 py-3">
            <p className="text-xs font-bold text-matcha">為什麼是這個答案？ / Why this answer?</p>
            <p className="mt-2 text-sm leading-6 text-ink/75">{question.grammar.explanationZh}</p>
          </div>
          <p className="mt-3 break-words text-sm font-bold leading-6 text-ink">{question.grammar.exampleJa}</p>
          <p className="mt-1 text-sm leading-6 text-ink/65">{question.grammar.exampleZh}</p>
        </>
      ) : null}

      {question.kind === "conjugation" ? (
        <>
          <p className="mt-2 text-sm leading-6 text-ink">
            意思：<span className="font-bold">{question.example.meaningZh}</span>
          </p>
          <div className="mt-3 rounded-lg bg-white/70 px-3 py-3">
            <p className="text-xs font-bold text-ink/50">Rule</p>
            <p className="mt-1 break-words text-sm font-bold leading-6 text-ink">{question.rule.rule}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/75">{question.rule.explanationZh}</p>
          {getConjugationNote(question) ? (
            <p className="mt-2 rounded-lg bg-white/75 px-3 py-3 text-sm leading-6 text-ink/70">
              {getConjugationNote(question)}
            </p>
          ) : null}
          {question.example.exampleJa ? (
            <>
              <p className="mt-3 break-words text-sm font-bold leading-6 text-ink">
                {question.example.exampleJa}
              </p>
              {question.example.exampleZh ? (
                <p className="mt-1 text-sm leading-6 text-ink/65">{question.example.exampleZh}</p>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}

      <button
        type="button"
        onClick={() => speakJapanese(speechText)}
        className="mt-3 rounded-full border border-matcha/30 bg-white px-4 py-2 text-sm font-bold text-matcha"
      >
        朗讀
      </button>
      <button
        type="button"
        onClick={onNext}
        className="mt-4 w-full rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white"
      >
        {isLastQuestion ? "查看結果" : "下一題"}
      </button>
    </div>
  );
}

function getConjugationNote(question: ReviewQuestion) {
  if (question.kind !== "conjugation") {
    return undefined;
  }

  if (question.rule.category === "i-adjective" && question.rule.form.includes("ば")) {
    return `い形容詞のば形：去掉「い」，加上「ければ」。${question.example.base} → ${question.example.result}`;
  }

  return undefined;
}
