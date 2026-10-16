import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BrainCircuit,
  FlaskConical,
  ListChecks,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  TerminalSquare,
} from 'lucide-react';
import { getModuleBySlug, getModuleSummaries } from '@/lib/netlearn-db';
import { CodeBlock, LessonSectionCard } from '@/components/lesson-section-card';
import { ModuleQuiz } from '@/components/module-quiz';
import { ModuleProgressControls } from '@/components/module-progress-controls';

type Props = { params: { id: string } };

export function generateStaticParams() {
  return getModuleSummaries().map(({ slug }) => ({ id: slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const mod = getModuleBySlug(params.id);
  return mod ? { title: `${mod.title} | NetLearn`, description: mod.description } : { title: 'Módulo não encontrado | NetLearn' };
}

function SectionHeading({ icon: Icon, children }: { icon: typeof Target; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
      <Icon className="h-4 w-4" />
      {children}
    </h2>
  );
}

export default function AulaPage({ params }: Props) {
  const mod = getModuleBySlug(params.id);
  if (!mod) notFound();

  const all = getModuleSummaries();
  const position = all.findIndex((m) => m.slug === mod.slug);
  const previous = position > 0 ? all[position - 1] : null;
  const next = position < all.length - 1 ? all[position + 1] : null;
  const { details } = mod;
  const keywords = Array.from(new Set(mod.lessons.flatMap((lesson) => lesson.keywords))).slice(0, 12);

  const toc = [
    { href: '#objetivos', label: 'Objetivos' },
    ...mod.lessons.map((lesson) => ({ href: `#${lesson.slug}`, label: lesson.title })),
    { href: '#comandos', label: 'Comandos úteis' },
    { href: '#erros-comuns', label: 'Erros comuns' },
    { href: '#seguranca', label: 'Segurança' },
    { href: '#laboratorio', label: 'Laboratório' },
    { href: '#quiz', label: 'Quiz' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <Link href="/aprender" className="inline-flex items-center gap-2 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Voltar para os módulos
        </Link>
        <span>
          Módulo {position + 1} de {all.length}
        </span>
      </div>

      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className={`mb-5 h-2 w-24 rounded-full bg-gradient-to-r ${mod.accent}`} />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
            <Rocket className="h-3.5 w-3.5" />
            Aula interativa
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">{mod.stage}</span>
        </div>
        <h1 className="text-3xl font-black text-white">{mod.title}</h1>
        <p className="mt-4 max-w-3xl text-slate-300">{mod.objective}</p>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">{mod.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">
              {keyword}
            </span>
          ))}
        </div>
        <div className="mt-6">
          <ModuleProgressControls slug={mod.slug} />
        </div>
      </section>

      <nav aria-label="Conteúdo do módulo" className="card-surface rounded-[28px] p-5">
        <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Neste módulo</div>
        <div className="flex flex-wrap gap-2">
          {toc.map(({ href, label }) => (
            <a key={href} href={href} className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-200 hover:border-cyan-400/60 hover:text-white">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="objetivos" className="card-surface scroll-mt-24 rounded-[28px] p-6">
        <SectionHeading icon={Target}>Objetivos de aprendizagem</SectionHeading>
        <ul className="grid gap-3 md:grid-cols-2">
          {details.objectives.map((objective) => (
            <li key={objective} className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-slate-200">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      {mod.lessons.map((lesson, index) => (
        <section key={lesson.slug} id={lesson.slug} className="card-surface scroll-mt-24 space-y-5 rounded-[28px] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">Aula {index + 1}</span>
            <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Introdução</h3>
              <p className="mt-2 leading-relaxed text-slate-300">{lesson.introduction}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Por que isso importa</h3>
              <p className="mt-2 leading-relaxed text-slate-300">{lesson.why_it_matters}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-blue-200">Explicação</h3>
            <p className="mt-2 leading-relaxed text-slate-200">{lesson.explanation}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {lesson.sections.map((section) => (
              <LessonSectionCard key={section.title} section={section} />
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Contexto real</h3>
            <p className="mt-2 leading-relaxed text-slate-300">{lesson.real_world}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Exercício</h3>
              <p className="mt-2 text-slate-200">{lesson.exercise}</p>
              <details className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <summary className="cursor-pointer text-sm font-medium text-emerald-200">Ver resposta</summary>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100">{lesson.exercise_answer}</p>
              </details>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
              <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-violet-200">
                <Sparkles className="h-4 w-4" />
                Desafio
              </h3>
              <p className="mt-2 text-slate-200">{lesson.challenge}</p>
            </div>
          </div>
        </section>
      ))}

      <section id="comandos" className="card-surface scroll-mt-24 rounded-[28px] p-6">
        <SectionHeading icon={TerminalSquare}>Comandos úteis</SectionHeading>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {details.commands.map((command) => (
            <div key={`${command.platform}-${command.title}`} className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">{command.title}</span>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300">{command.platform}</span>
              </div>
              <CodeBlock code={command.code} />
              {command.note ? <p className="mt-2 text-sm text-slate-400">{command.note}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section id="erros-comuns" className="card-surface scroll-mt-24 rounded-[28px] p-6">
          <SectionHeading icon={AlertTriangle}>Erros comuns e troubleshooting</SectionHeading>
          <ul className="space-y-3">
            {details.pitfalls.map(({ problem, solution }) => (
              <li key={problem} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
                <div className="font-medium text-amber-200">{problem}</div>
                <div className="mt-1 text-slate-300">{solution}</div>
              </li>
            ))}
          </ul>
        </section>

        <section id="seguranca" className="card-surface scroll-mt-24 rounded-[28px] p-6">
          <SectionHeading icon={ShieldAlert}>Segurança</SectionHeading>
          <ul className="space-y-3">
            {details.security.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-slate-200">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-surface rounded-[28px] p-6">
        <SectionHeading icon={ListChecks}>Pontos-chave</SectionHeading>
        <ul className="grid gap-3 md:grid-cols-2">
          {details.keyPoints.map((point) => (
            <li key={point} className="flex gap-2 text-slate-200">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section id="laboratorio" className="card-surface scroll-mt-24 rounded-[28px] p-6">
        <SectionHeading icon={FlaskConical}>Laboratório prático</SectionHeading>
        <h3 className="text-xl font-bold text-white">{details.lab.title}</h3>
        <p className="mt-2 text-slate-300">
          <span className="font-medium text-slate-100">Objetivo:</span> {details.lab.goal}
        </p>
        <p className="mt-1 text-slate-300">
          <span className="font-medium text-slate-100">Ferramentas:</span> {details.lab.tools}
        </p>
        <ol className="mt-4 space-y-2 text-slate-300">
          {details.lab.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-semibold text-cyan-200">{index + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <span className="font-medium">Resultado esperado:</span> {details.lab.expected}
        </div>
      </section>

      <section id="quiz" className="card-surface scroll-mt-24 rounded-[28px] p-6">
        <SectionHeading icon={BrainCircuit}>{mod.slug === 'desafio-final' ? 'Prova final' : 'Quiz do módulo'}</SectionHeading>
        <ModuleQuiz slug={mod.slug} questions={mod.quizQuestions} />
      </section>

      <section className="card-surface rounded-[28px] p-6">
        <SectionHeading icon={BookMarked}>Leituras recomendadas</SectionHeading>
        <ul className="space-y-2 text-sm text-slate-300">
          {details.references.map((reference) => (
            <li key={reference}>• {reference}</li>
          ))}
        </ul>
      </section>

      <nav aria-label="Navegação entre módulos" className="grid gap-4 sm:grid-cols-2">
        {previous ? (
          <Link href={`/aulas/${previous.slug}`} className="card-surface rounded-[24px] p-5 transition hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </div>
            <div className="mt-2 font-semibold text-white">{previous.title}</div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link href={`/aulas/${next.slug}`} className="card-surface rounded-[24px] p-5 text-right transition hover:-translate-y-0.5">
            <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Próximo <ArrowRight className="h-4 w-4" />
            </div>
            <div className="mt-2 font-semibold text-white">{next.title}</div>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
