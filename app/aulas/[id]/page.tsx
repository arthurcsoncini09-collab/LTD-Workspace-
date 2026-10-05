import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lightbulb, Rocket, Sparkles } from 'lucide-react';
import { getModuleBySlug } from '@/lib/netlearn-db';

export default function AulaPage({ params }: { params: { id: string } }) {
  const module = getModuleBySlug(params.id);

  if (!module) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Link href="/aprender" className="inline-flex items-center gap-2 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Voltar para trilha
        </Link>
      </div>

      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
          <Rocket className="h-3.5 w-3.5" />
          Aula interativa
        </div>
        <h1 className="text-3xl font-black text-white">{module.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{module.objective}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {module.lessons.flatMap((lesson) => lesson.keywords).slice(0, 10).map((keyword: string) => (
            <span key={keyword} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">{keyword}</span>
          ))}
        </div>
      </section>

      {module.lessons.map((lesson) => (
        <section key={lesson.slug} className="space-y-5 card-surface rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{lesson.title}</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Introdução</h2>
              <p className="mt-2 text-slate-300">{lesson.introduction}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Por que isso importa</h2>
              <p className="mt-2 text-slate-300">{lesson.why_it_matters}</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {lesson.sections.map((section: { title: string; content?: string; example?: string; items?: string[]; steps?: string[] }) => (
              <article key={section.title} className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-5">
                <div className="mb-3 flex items-center gap-2 text-cyan-300">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-[0.2em]">{section.title}</span>
                </div>

                {section.content ? <p className="text-slate-300">{section.content}</p> : null}

                {section.items ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.steps ? (
                  <ol className="mt-3 space-y-2 text-sm text-slate-300">
                    {section.steps.map((step) => (
                      <li key={step} className="flex gap-2">
                        <span className="font-semibold text-cyan-300">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {section.example ? <div className="mt-3 text-sm text-cyan-200">Exemplo: {section.example}</div> : null}
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Contexto real</h2>
            <p className="mt-2 text-slate-300">{lesson.real_world}</p>
          </div>
        </section>
      ))}

      <section className="card-surface rounded-[28px] p-6">
        <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
          <Sparkles className="h-4 w-4" />
          Exercícios rápidos
        </div>

        <div className="space-y-5">
          {module.quizQuestions.map((quiz) => (
            <div key={quiz.question} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="text-lg font-medium text-white">{quiz.question}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                {quiz.options.map((option: string) => (
                  <button key={option} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{option}</button>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4" /> Correção</div>
                <div className="mt-2">Resposta correta: {quiz.answer}</div>
                <div className="mt-2 text-emerald-100">{quiz.explanation}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
