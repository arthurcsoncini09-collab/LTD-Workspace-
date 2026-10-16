'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useProgress } from './progress-store';

export type TrailModule = {
  slug: string;
  title: string;
  stage: string;
  description: string;
  accent: string;
  lessonCount: number;
  questionCount: number;
};

/** Título sem o prefixo "Módulo N — ", já que a posição é mostrada à parte. */
export function shortTitle(title: string) {
  return title.replace(/^Módulo \d+\s*—\s*/, '');
}

export function TrailList({ modules }: { modules: TrailModule[] }) {
  const { completed, quizScores } = useProgress();

  return (
    <ol className="space-y-4">
      {modules.map((mod, index) => {
        const done = completed.includes(mod.slug);
        const score = quizScores[mod.slug];
        return (
          <li key={mod.slug}>
            <Link
              href={`/aulas/${mod.slug}`}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition hover:border-cyan-400/50 ${
                done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-slate-950 ${
                  done ? 'bg-emerald-400' : `bg-gradient-to-r ${mod.accent}`
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" aria-label="Concluído" /> : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-medium text-white">{shortTitle(mod.title)}</div>
                <div className="mt-0.5 truncate text-sm text-slate-400">{mod.description}</div>
              </div>
              <div className="hidden shrink-0 text-right text-xs text-slate-400 sm:block">
                <div>{mod.stage}</div>
                <div className="mt-1">{score ? `Quiz: ${score.correct}/${score.total}` : `${mod.lessonCount} aulas · ${mod.questionCount} questões`}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
