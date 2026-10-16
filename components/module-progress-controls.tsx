'use client';

import { useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { progressActions, useProgress } from './progress-store';

/** Registra a visita ao módulo e oferece o botão de marcar como concluído. */
export function ModuleProgressControls({ slug }: { slug: string }) {
  const progress = useProgress();
  const done = progress.completed.includes(slug);
  const score = progress.quizScores[slug];

  useEffect(() => {
    progressActions.visit(slug);
  }, [slug]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => progressActions.toggleCompleted(slug)}
        aria-pressed={done}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
          done ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40' : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950'
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        {done ? 'Módulo concluído' : 'Marcar como concluído'}
      </button>
      {score ? (
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
          Melhor nota no quiz: {score.correct}/{score.total}
        </span>
      ) : null}
    </div>
  );
}
