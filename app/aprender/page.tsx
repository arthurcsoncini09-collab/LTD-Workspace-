import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getModuleSummaries } from '@/lib/netlearn-db';

const stageOrder = ['Básico', 'Intermediário', 'Avançado', 'Projeto'];

export default function AprenderPage() {
  const modules = getModuleSummaries();
  const stages = stageOrder.filter((stage) => modules.some((mod) => mod.stage === stage));

  return (
    <div className="space-y-10">
      <section className="card-surface rounded-xl p-6 sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Aprender</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Trilha de aprendizado em redes</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Tudo começa com conceitos simples e evolui para laboratórios, exercícios e simulações que ajudam a visualizar o que acontece dentro da rede. São{' '}
          {modules.length} módulos organizados por nível.
        </p>
      </section>

      {stages.map((stage) => (
        <section key={stage} className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">{stage}</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {modules
              .filter((mod) => mod.stage === stage)
              .map(({ slug, title, description, accent, lessonCount, questionCount }) => (
                <Link key={slug} href={`/aulas/${slug}`} className="card-surface rounded-xl p-5 transition hover:border-slate-600">
                  <div className={`mb-4 h-2 w-24 rounded-full bg-gradient-to-r ${accent}`} />
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {lessonCount} aulas · {questionCount} questões
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
