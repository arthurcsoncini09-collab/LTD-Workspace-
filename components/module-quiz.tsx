'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { progressActions } from './progress-store';

export type QuizItem = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export function ModuleQuiz({ slug, questions }: { slug: string; questions: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q, index) => answers[index] === q.answer).length;
  const finished = questions.length > 0 && answeredCount === questions.length;

  useEffect(() => {
    if (finished) progressActions.saveQuizScore(slug, correctCount, questions.length);
  }, [finished, slug, correctCount, questions.length]);

  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span>
          Respondidas: {answeredCount}/{questions.length}
        </span>
        <span>Acertos: {correctCount}</span>
      </div>

      {questions.map((quiz, index) => {
        const chosen = answers[index];
        const answered = chosen !== undefined;
        const isCorrect = chosen === quiz.answer;

        return (
          <fieldset key={quiz.question} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <legend className="sr-only">Questão {index + 1}</legend>
            <div className="text-lg font-medium text-white">
              <span className="mr-2 text-cyan-300">{index + 1}.</span>
              {quiz.question}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quiz.options.map((option) => {
                const isAnswer = option === quiz.answer;
                const isChosen = option === chosen;
                let tone = 'border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400/60';
                if (answered && isAnswer) tone = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100';
                else if (answered && isChosen) tone = 'border-rose-500/60 bg-rose-500/15 text-rose-100';
                else if (answered) tone = 'border-slate-800 bg-slate-900/60 text-slate-400';

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    aria-pressed={isChosen}
                    onClick={() => setAnswers((prev) => ({ ...prev, [index]: option }))}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-default ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {answered ? (
              <div
                role="status"
                className={`mt-5 rounded-xl border p-3 text-sm ${
                  isCorrect ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {isCorrect ? 'Correto!' : `Resposta correta: ${quiz.answer}`}
                </div>
                <div className="mt-2 text-slate-200">{quiz.explanation}</div>
              </div>
            ) : null}
          </fieldset>
        );
      })}

      {finished ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Resultado</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {correctCount}/{questions.length} ({percent}%)
            </div>
            <div className="mt-1 text-sm text-slate-300">
              {percent >= 70 ? 'Ótimo! Você domina este módulo.' : 'Revise as aulas e tente novamente — a meta é 70% ou mais.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-400"
          >
            <RotateCcw className="h-4 w-4" />
            Refazer quiz
          </button>
        </div>
      ) : null}
    </div>
  );
}
