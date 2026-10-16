'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ModuleQuiz, type QuizItem } from './module-quiz';
import { useProgress } from './progress-store';
import { shortTitle } from './trail-list';

export type QuizModule = { slug: string; title: string; questions: QuizItem[] };

export function QuizPicker({ modules }: { modules: QuizModule[] }) {
  const [selected, setSelected] = useState(modules[0]?.slug ?? '');
  const { quizScores } = useProgress();
  const current = modules.find((mod) => mod.slug === selected);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
      <div className="card-surface h-fit rounded-[28px] p-4">
        <label htmlFor="quiz-select" className="mb-2 block text-sm text-slate-300 xl:hidden">
          Escolha o módulo
        </label>
        <select
          id="quiz-select"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white xl:hidden"
        >
          {modules.map((mod) => (
            <option key={mod.slug} value={mod.slug}>
              {mod.title}
            </option>
          ))}
        </select>

        <ul className="hidden space-y-1 xl:block">
          {modules.map((mod, index) => {
            const score = quizScores[mod.slug];
            const active = mod.slug === selected;
            return (
              <li key={mod.slug}>
                <button
                  type="button"
                  onClick={() => setSelected(mod.slug)}
                  aria-current={active}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-blue-500/15 text-blue-100 ring-1 ring-blue-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>
                    {index + 1}. {shortTitle(mod.title)}
                  </span>
                  {score ? (
                    <span className={`text-xs ${score.correct / score.total >= 0.7 ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {score.correct}/{score.total}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {current ? (
        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">{current.title}</h2>
            <Link href={`/aulas/${current.slug}`} className="text-sm text-cyan-300 hover:text-cyan-200">
              Revisar o conteúdo →
            </Link>
          </div>
          {/* key reinicia o quiz ao trocar de módulo */}
          <ModuleQuiz key={current.slug} slug={current.slug} questions={current.questions} />
        </div>
      ) : null}
    </div>
  );
}
