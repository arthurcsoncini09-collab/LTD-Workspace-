'use client';

import Link from 'next/link';
import { ArrowLeft, Award, CheckCircle2, Circle, FileBadge2, Lock, Printer, ScrollText } from 'lucide-react';
import {
  MIN_SCORE,
  TRAIL_SLUG,
  TRAIL_TITLE,
  certificateCode,
  formatDateLong,
  formatPercent,
  moduleStatus,
  trailStatus,
  type CertModule,
} from '@/lib/certificates';
import { useProgress } from '../progress-store';
import { setCertName, useCertName } from './cert-name';
import { CertificateSheet, type CertificateData } from './certificate-sheet';

const pad = (n: number) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// Campo do nome

function NameField() {
  const { typed, accountName, name } = useCertName();
  return (
    <label className="block text-sm text-slate-300">
      Nome que vai no certificado
      <input
        value={typed}
        onChange={(e) => setCertName(e.target.value)}
        placeholder={accountName || 'Digite seu nome completo'}
        maxLength={80}
        autoComplete="name"
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
      />
      <span className="mt-1 block text-xs text-slate-500">
        {accountName && !typed
          ? `Usando o nome da sua conta. Digite outro se quiser o nome completo.`
          : name
            ? 'Salvo neste navegador.'
            : 'Obrigatório para imprimir.'}
      </span>
    </label>
  );
}

function Requirement({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-2 text-sm ${ok ? 'text-emerald-200' : 'text-slate-300'}`}>
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />}
      <span>{children}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Aviso dentro da aula

export function CertificateCallout({ slug }: { slug: string }) {
  const status = moduleStatus(slug, useProgress());
  return (
    <div className={`rounded-xl border p-4 ${status.eligible ? 'border-amber-300/40 bg-amber-300/[0.06]' : 'border-slate-800 bg-slate-950/50'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <FileBadge2 className={`h-4 w-4 ${status.eligible ? 'text-amber-200' : 'text-slate-400'}`} />
          {status.eligible ? 'Seu certificado deste módulo está pronto' : 'Certificado do módulo'}
        </div>
        {status.eligible ? (
          <Link
            href={`/certificados/${slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-300"
          >
            <Printer className="h-4 w-4" />
            Ver e imprimir
          </Link>
        ) : null}
      </div>
      {!status.eligible ? (
        <ul className="mt-3 space-y-1.5">
          <Requirement ok={status.completed}>Marcar o módulo como concluído</Requirement>
          <Requirement ok={status.scoreOk}>
            Tirar pelo menos {formatPercent(MIN_SCORE)} no quiz
            {status.score !== null ? ` (sua melhor nota: ${formatPercent(status.score)})` : ''}
          </Requirement>
        </ul>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página com todos os certificados

export function CertificatesHub({ modules }: { modules: CertModule[] }) {
  const progress = useProgress();
  const trail = trailStatus(modules, progress);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Certificados</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Seus certificados</h1>
            <p className="mt-3 text-slate-300">
              Cada módulo rende um certificado para imprimir ou salvar em PDF. Ele libera quando você marca o módulo como concluído e tira
              pelo menos {formatPercent(MIN_SCORE)} no quiz. Com os {modules.length}, você ganha também o certificado da trilha completa.
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">
              {trail.earnedCount}
              <span className="text-xl text-slate-500">/{modules.length}</span>
            </div>
            <div className="text-xs text-slate-400">certificados de módulo</div>
          </div>
        </div>
        <div className="mt-6 max-w-md">
          <NameField />
        </div>
      </section>

      <Link
        href={`/certificados/${TRAIL_SLUG}`}
        aria-disabled={!trail.eligible}
        className={`card-surface flex flex-col gap-4 rounded-xl p-6 transition sm:flex-row sm:items-center ${
          trail.eligible ? 'border-amber-300/50 hover:border-amber-200' : 'pointer-events-none opacity-70'
        }`}
      >
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
            trail.eligible ? 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-amber-950' : 'bg-slate-800 text-slate-500'
          }`}
        >
          <Award className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-white">Certificado da trilha completa</div>
          <div className="text-sm text-slate-300">{TRAIL_TITLE} · todos os {modules.length} módulos</div>
          <div className="mt-3 progress-bar max-w-md" role="progressbar" aria-label="Certificados de módulo" aria-valuenow={trail.earnedCount} aria-valuemin={0} aria-valuemax={modules.length}>
            <span style={{ width: `${(trail.earnedCount / modules.length) * 100}%` }} />
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 text-sm font-semibold ${trail.eligible ? 'text-amber-200' : 'text-slate-500'}`}>
          {trail.eligible ? <Printer className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {trail.eligible ? 'Ver e imprimir' : `Faltam ${modules.length - trail.earnedCount}`}
        </div>
      </Link>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => {
          const status = trail.statuses.find((s) => s.slug === mod.slug)!;
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${
                    status.eligible ? 'bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/40' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {pad(mod.order_index)}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    status.eligible ? 'bg-emerald-500/15 text-emerald-200' : 'border border-slate-700 text-slate-400'
                  }`}
                >
                  {status.eligible ? 'Disponível' : 'Bloqueado'}
                </span>
              </div>
              <div className={`mt-3 font-semibold ${status.eligible ? 'text-white' : 'text-slate-300'}`}>{mod.title}</div>
              {status.eligible ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="text-slate-400">
                    Nota {formatPercent(status.score!)} · {formatDateLong(status.issuedAt!)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-amber-200">
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </span>
                </div>
              ) : (
                <ul className="mt-3 space-y-1">
                  <Requirement ok={status.completed}>Módulo concluído</Requirement>
                  <Requirement ok={status.scoreOk}>
                    Quiz com {formatPercent(MIN_SCORE)} ou mais{status.score !== null ? ` (agora: ${formatPercent(status.score)})` : ''}
                  </Requirement>
                </ul>
              )}
            </>
          );
          return status.eligible ? (
            <Link key={mod.slug} href={`/certificados/${mod.slug}`} className="card-surface rounded-xl p-5 transition hover:border-amber-300/50">
              {body}
            </Link>
          ) : (
            <Link key={mod.slug} href={`/aulas/${mod.slug}`} className="card-surface rounded-xl p-5 transition hover:border-slate-600" title="Ir para o módulo">
              {body}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Um certificado

type ViewProps =
  | { kind: 'module'; module: CertModule; lessons: string[] }
  | { kind: 'trail'; modules: CertModule[] };

export function CertificateView(props: ViewProps) {
  const progress = useProgress();
  const { name } = useCertName();

  let data: CertificateData | null = null;
  let locked: React.ReactNode = null;

  if (props.kind === 'module') {
    const mod = props.module;
    const status = moduleStatus(mod.slug, progress);
    const quiz = progress.quizScores[mod.slug];
    if (status.eligible && quiz) {
      data = {
        kind: 'module',
        name: name || 'Seu nome aqui',
        heading: `Módulo ${pad(mod.order_index)} · ${mod.title}`,
        statement: `concluiu o Módulo ${pad(mod.order_index)} — ${mod.title}, da trilha ${TRAIL_TITLE} do NetLearn, com ${mod.lessonCount} ${
          mod.lessonCount === 1 ? 'aula' : 'aulas'
        } e aproveitamento de ${formatPercent(status.score!)} no quiz do módulo (${quiz.correct} de ${quiz.total} questões).`,
        topics: props.lessons,
        seal: pad(mod.order_index),
        sealLabel: 'Módulo',
        issuedOn: formatDateLong(status.issuedAt!),
        code: certificateCode(name, mod.slug, status.issuedAt!),
      };
    } else {
      locked = (
        <ul className="mt-4 space-y-2">
          <Requirement ok={status.completed}>Marcar o módulo como concluído</Requirement>
          <Requirement ok={status.scoreOk}>
            Tirar pelo menos {formatPercent(MIN_SCORE)} no quiz{status.score !== null ? ` (sua melhor nota: ${formatPercent(status.score)})` : ''}
          </Requirement>
        </ul>
      );
    }
  } else {
    const trail = trailStatus(props.modules, progress);
    const lessons = props.modules.reduce((sum, m) => sum + m.lessonCount, 0);
    if (trail.eligible) {
      data = {
        kind: 'trail',
        name: name || 'Seu nome aqui',
        heading: TRAIL_TITLE,
        statement: `concluiu a trilha ${TRAIL_TITLE} do NetLearn: ${props.modules.length} módulos e ${lessons} aulas, da introdução às redes ao desafio final, com média de ${formatPercent(
          trail.average!,
        )} de acertos nos quizzes.`,
        topics: props.modules.map((m) => `${pad(m.order_index)}. ${m.title}`),
        seal: String(props.modules.length),
        sealLabel: 'Módulos',
        issuedOn: formatDateLong(trail.issuedAt!),
        code: certificateCode(name, TRAIL_SLUG, trail.issuedAt!),
      };
    } else {
      locked = (
        <p className="mt-4 text-sm text-slate-300">
          Você tem {trail.earnedCount} de {props.modules.length} certificados de módulo. Conquiste todos para liberar o da trilha.
        </p>
      );
    }
  }

  const title = props.kind === 'module' ? `Módulo ${pad(props.module.order_index)} · ${props.module.title}` : 'Trilha completa';

  return (
    <div className="space-y-6">
      <Link href="/certificados" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Todos os certificados
      </Link>

      {data ? (
        <>
          <section className="card-surface rounded-xl p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Certificado</div>
                <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
                <p className="mt-2 max-w-xl text-sm text-slate-400">
                  Na janela de impressão, escolha <strong className="text-slate-200">Salvar como PDF</strong> para guardar o arquivo, ou a sua
                  impressora. Deixe a orientação em <strong className="text-slate-200">paisagem</strong> e ative{' '}
                  <strong className="text-slate-200">Gráficos de fundo</strong>, se aparecer.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
                <div className="sm:w-72">
                  <NameField />
                </div>
                <button
                  type="button"
                  disabled={!name}
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:mb-6"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir ou salvar PDF
                </button>
              </div>
            </div>
          </section>
          <CertificateSheet data={data} />
        </>
      ) : (
        <section className="card-surface max-w-xl rounded-xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ScrollText className="h-4 w-4 text-slate-400" />
            {title}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white">Certificado ainda bloqueado</h1>
          {locked}
          {props.kind === 'module' ? (
            <Link href={`/aulas/${props.module.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
              Ir para o módulo
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
