'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, CheckCircle2, Flag, Play, ShieldCheck, ShieldX, X, XCircle } from 'lucide-react';
import { seededShuffle } from '@/lib/simulacao/levels';
import type { ClassifyLevel, ConfigLevel, DiagnoseLevel, FirewallLevel, LogsLevel, SequenceLevel } from '@/lib/simulacao/types';

export type MechanicProps<L> = {
  level: L;
  solved: boolean;
  onMistake: () => void;
  onSolved: () => void;
};

const panel = 'rounded-2xl border border-slate-800 bg-slate-950/60 p-4';
const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40';

function Feedback({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const styles = {
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diagnóstico: terminal com comandos + pergunta

export function DiagnoseMechanic({ level, solved, onMistake, onSolved }: MechanicProps<DiagnoseLevel>) {
  const [history, setHistory] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const ran = new Set(history);
  const canAnswer = ran.size >= level.minCommands;

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-3">
        <div className="text-sm font-medium text-slate-300">Terminal — clique em um comando para executá-lo</div>
        <div className="flex flex-wrap gap-2">
          {level.commands.map((command, index) => (
            <button
              key={command.cmd}
              type="button"
              onClick={() => setHistory((h) => [...h, index])}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
                ran.has(index) ? 'border-slate-700 text-slate-400' : 'border-cyan-400/40 text-cyan-100 hover:bg-cyan-400/10'
              }`}
            >
              <Play className="h-3 w-3" />
              {command.cmd}
            </button>
          ))}
        </div>
        <div
          ref={terminalRef}
          className="soft-scrollbar h-80 overflow-y-auto rounded-2xl border border-slate-800 bg-black/70 p-4 font-mono text-xs leading-relaxed text-slate-200"
          aria-live="polite"
        >
          {history.length === 0 ? <div className="text-slate-500">Nenhum comando executado ainda.</div> : null}
          {history.map((index, i) => (
            <div key={i} className="mb-4">
              <div className="text-emerald-300">
                {level.prompt} <span className="text-white">{level.commands[index].cmd}</span>
              </div>
              <pre className="mt-1 whitespace-pre-wrap break-words text-slate-300">{level.commands[index].output}</pre>
            </div>
          ))}
          <div className="text-emerald-300">
            {level.prompt} <span className="animate-pulse">▌</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-white">{level.question}</div>
        {!canAnswer ? (
          <Feedback tone="info">
            Investigue antes de responder: execute pelo menos {level.minCommands} comandos diferentes ({ran.size}/{level.minCommands}).
          </Feedback>
        ) : null}
        <div className="space-y-2">
          {level.options.map((option, index) => {
            const isWrong = wrong.includes(index);
            const isRight = solved && option.correct;
            return (
              <button
                key={option.text}
                type="button"
                disabled={!canAnswer || isWrong || solved}
                onClick={() => {
                  if (option.correct) {
                    setLastFeedback({ tone: 'success', text: option.feedback });
                    onSolved();
                  } else {
                    setWrong((w) => [...w, index]);
                    setLastFeedback({ tone: 'error', text: option.feedback });
                    onMistake();
                  }
                }}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed ${
                  isRight
                    ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
                    : isWrong
                      ? 'border-rose-500/30 bg-rose-500/5 text-slate-500 line-through'
                      : 'border-slate-700 text-slate-200 hover:border-cyan-400/50 hover:bg-slate-900 disabled:opacity-50 disabled:hover:border-slate-700 disabled:hover:bg-transparent'
                }`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>
        {lastFeedback ? <Feedback tone={lastFeedback.tone}>{lastFeedback.text}</Feedback> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Configuração: formulário validado

export function ConfigMechanic({ level, solved, onMistake, onSolved }: MechanicProps<ConfigLevel>) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(level.fields.map((f) => [f.id, ''])));
  const [errors, setErrors] = useState<string[]>([]);
  const filled = level.fields.every((f) => values[f.id].trim() !== '');

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!filled || solved) return;
        const problems = level.validate(values);
        setErrors(problems);
        if (problems.length === 0) onSolved();
        else onMistake();
      }}
    >
      <p className="text-sm text-slate-300">{level.instruction}</p>
      <div className={`${panel} grid gap-4 md:grid-cols-2`}>
        {level.fields.map((field) => (
          <label key={field.id} className="block text-sm text-slate-300">
            {field.label}
            <div className="mt-2 flex items-center gap-2">
              <input
                value={values[field.id]}
                onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                placeholder={field.placeholder}
                disabled={solved}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-white placeholder:text-slate-600 focus:border-cyan-400/60 focus:outline-none disabled:opacity-70"
              />
              {field.prefix ? <span className="font-mono text-slate-400">{field.prefix}</span> : null}
            </div>
          </label>
        ))}
      </div>
      {!solved ? (
        <button type="submit" disabled={!filled} className={primaryButton}>
          <Check className="h-4 w-4" />
          Aplicar configuração
        </button>
      ) : null}
      {errors.length > 0 ? (
        <Feedback tone="error">
          <div className="mb-2 font-semibold">A configuração não funcionou:</div>
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Feedback>
      ) : null}
      {solved ? <Feedback tone="success">Configuração aplicada e testada com sucesso!</Feedback> : null}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Organização: clicar no item e depois no grupo

export function ClassifyMechanic({ level, solved, onMistake, onSolved }: MechanicProps<ClassifyLevel>) {
  const order = useMemo(() => seededShuffle(level.items, level.id), [level]);
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pool = order.filter((item) => !placement[item.id]);
  const allPlaced = pool.length === 0;

  const place = (bucket: string) => {
    if (!selected || solved) return;
    setPlacement((p) => ({ ...p, [selected]: bucket }));
    setSelected(null);
  };

  const check = () => {
    const wrongIds = level.items.filter((item) => placement[item.id] !== item.bucket).map((item) => item.id);
    if (wrongIds.length === 0) {
      setLocked(level.items.map((i) => i.id));
      setMessage(null);
      onSolved();
      return;
    }
    // Os certos ficam travados; os errados voltam para a lista.
    setLocked(level.items.filter((i) => !wrongIds.includes(i.id)).map((i) => i.id));
    setPlacement((p) => Object.fromEntries(Object.entries(p).filter(([id]) => !wrongIds.includes(id))));
    setMessage(`${wrongIds.length} ${wrongIds.length === 1 ? 'item estava no lugar errado e voltou' : 'itens estavam no lugar errado e voltaram'} para a lista. Os acertos ficaram travados.`);
    onMistake();
  };

  const chip = (id: string, label: string, inBucket: boolean) => {
    const isLocked = locked.includes(id);
    const isSelected = selected === id;
    return (
      <button
        key={id}
        type="button"
        disabled={solved || isLocked}
        onClick={() => {
          if (inBucket) {
            setPlacement((p) => {
              const next = { ...p };
              delete next[id];
              return next;
            });
            setSelected(id);
          } else setSelected(isSelected ? null : id);
        }}
        className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
          isLocked
            ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            : isSelected
              ? 'border-cyan-300 bg-cyan-400/15 text-white ring-2 ring-cyan-400/40'
              : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
        }`}
      >
        {isLocked ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-300">{level.instruction}</p>
      {!solved ? (
        <div className={panel}>
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            Itens para posicionar {selected ? '— agora clique no grupo de destino' : ''}
          </div>
          {pool.length ? (
            <div className="grid gap-2 sm:grid-cols-2">{pool.map((item) => chip(item.id, item.label, false))}</div>
          ) : (
            <div className="text-sm text-slate-400">Todos os itens foram posicionados.</div>
          )}
        </div>
      ) : null}

      <div className={`grid gap-4 ${level.buckets.length === 2 ? 'md:grid-cols-2' : level.buckets.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
        {level.buckets.map((bucket) => (
          <div
            key={bucket.id}
            role="button"
            tabIndex={selected ? 0 : -1}
            onClick={() => place(bucket.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                place(bucket.id);
              }
            }}
            className={`min-h-[140px] rounded-2xl border-2 border-dashed p-4 transition ${
              selected ? 'cursor-pointer border-cyan-400/60 bg-cyan-400/5 hover:bg-cyan-400/10' : 'border-slate-700 bg-slate-950/40'
            }`}
          >
            <div className="font-semibold text-white">{bucket.label}</div>
            <div className="mb-3 text-xs text-slate-400">{bucket.description}</div>
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              {order.filter((item) => placement[item.id] === bucket.id).map((item) => chip(item.id, item.label, true))}
            </div>
          </div>
        ))}
      </div>

      {!solved ? (
        <button type="button" disabled={!allPlaced} onClick={check} className={primaryButton}>
          <Check className="h-4 w-4" />
          Verificar
        </button>
      ) : null}
      {message ? <Feedback tone="error">{message}</Feedback> : null}
      {solved ? (
        <div className={panel}>
          <div className="mb-3 text-sm font-semibold text-white">Por que cada item ficou onde ficou</div>
          <ul className="space-y-2 text-sm text-slate-300">
            {level.items.map((item) => (
              <li key={item.id}>
                <span className="font-medium text-slate-100">{item.label}:</span> {item.why}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Firewall: permitir ou bloquear cada regra

export function FirewallMechanic({ level, solved, onMistake, onSolved }: MechanicProps<FirewallLevel>) {
  const [actions, setActions] = useState<Record<string, 'allow' | 'deny'>>({});
  const [wrong, setWrong] = useState<string[]>([]);
  const complete = level.rules.every((rule) => actions[rule.id]);

  const apply = () => {
    const bad = level.rules.filter((rule) => actions[rule.id] !== rule.correct).map((rule) => rule.id);
    setWrong(bad);
    if (bad.length === 0) onSolved();
    else onMistake();
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-300">{level.instruction}</p>
      <div className={panel}>
        <div className="mb-2 text-sm font-semibold text-white">Requisitos</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {level.requirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Protocolo/Porta</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {level.rules.map((rule, index) => {
              const isWrong = wrong.includes(rule.id);
              return (
                <tr key={rule.id} className={`border-t border-slate-800 ${isWrong ? 'bg-rose-500/10' : ''}`}>
                  <td className="px-4 py-3 font-mono text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3 text-slate-100">{rule.service}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {rule.protocol}/{rule.port}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{rule.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(['allow', 'deny'] as const).map((value) => {
                        const active = actions[rule.id] === value;
                        const Icon = value === 'allow' ? ShieldCheck : ShieldX;
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={solved}
                            aria-pressed={active}
                            onClick={() => {
                              setActions((a) => ({ ...a, [rule.id]: value }));
                              setWrong((w) => w.filter((id) => id !== rule.id));
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                              active
                                ? value === 'allow'
                                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                                  : 'border-rose-400/60 bg-rose-500/15 text-rose-100'
                                : 'border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {value === 'allow' ? 'Permitir' : 'Bloquear'}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!solved ? (
        <button type="button" disabled={!complete} onClick={apply} className={primaryButton}>
          <Check className="h-4 w-4" />
          Aplicar regras
        </button>
      ) : null}
      {wrong.length > 0 ? (
        <Feedback tone="error">
          {wrong.length === 1 ? 'Uma regra não atende' : `${wrong.length} regras não atendem`} aos requisitos (destacadas em vermelho). Releia os requisitos e ajuste.
        </Feedback>
      ) : null}
      {solved ? (
        <div className={panel}>
          <div className="mb-3 text-sm font-semibold text-white">O motivo de cada regra</div>
          <ul className="space-y-2 text-sm text-slate-300">
            {level.rules.map((rule, index) => (
              <li key={rule.id}>
                <span className="font-medium text-slate-100">
                  {index + 1}. {rule.service} ({rule.correct === 'allow' ? 'permitir' : 'bloquear'}):
                </span>{' '}
                {rule.why}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Análise de logs: marcar as linhas suspeitas

export function LogsMechanic({ level, solved, onMistake, onSolved }: MechanicProps<LogsLevel>) {
  const [flagged, setFlagged] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [falsePositives, setFalsePositives] = useState<string[]>([]);

  const submit = () => {
    const suspicious = level.lines.filter((l) => l.suspicious).map((l) => l.id);
    const missed = suspicious.filter((id) => !flagged.includes(id)).length;
    const extra = flagged.filter((id) => !suspicious.includes(id));
    if (missed === 0 && extra.length === 0) {
      setReport(null);
      setFalsePositives([]);
      onSolved();
      return;
    }
    const parts = [];
    if (missed) parts.push(`${missed} ${missed === 1 ? 'linha do ataque ficou' : 'linhas do ataque ficaram'} de fora`);
    if (extra.length) parts.push(`${extra.length} ${extra.length === 1 ? 'linha marcada é atividade normal' : 'linhas marcadas são atividade normal'} (destacadas)`);
    setReport(`Relatório incompleto: ${parts.join(' e ')}.`);
    setFalsePositives(extra);
    onMistake();
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-300">{level.instruction}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/70">
        <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 font-mono text-xs text-slate-400">{level.file}</div>
        <div className="divide-y divide-slate-900">
          {level.lines.map((line) => {
            const isFlagged = flagged.includes(line.id);
            const isFalse = falsePositives.includes(line.id);
            return (
              <button
                key={line.id}
                type="button"
                disabled={solved}
                aria-pressed={isFlagged}
                onClick={() => {
                  setFlagged((f) => (f.includes(line.id) ? f.filter((id) => id !== line.id) : [...f, line.id]));
                  setFalsePositives((f) => f.filter((id) => id !== line.id));
                }}
                className={`flex w-full items-start gap-3 px-4 py-2 text-left font-mono text-xs transition ${
                  isFalse
                    ? 'bg-amber-500/15 text-amber-100'
                    : isFlagged
                      ? 'bg-rose-500/15 text-rose-100'
                      : 'text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                <Flag className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isFlagged ? 'text-rose-300' : 'text-slate-700'}`} />
                <span className="break-all">{line.text}</span>
              </button>
            );
          })}
        </div>
      </div>
      {!solved ? (
        <button type="button" disabled={flagged.length === 0} onClick={submit} className={primaryButton}>
          <Flag className="h-4 w-4" />
          Enviar relatório ({flagged.length} {flagged.length === 1 ? 'linha marcada' : 'linhas marcadas'})
        </button>
      ) : null}
      {report ? <Feedback tone="error">{report}</Feedback> : null}
      {solved ? (
        <div className={panel}>
          <div className="mb-3 text-sm font-semibold text-white">Linha por linha</div>
          <ul className="space-y-2 text-sm text-slate-300">
            {level.lines.map((line, index) => (
              <li key={line.id} className="flex gap-2">
                {line.suspicious ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}
                <span>
                  <span className="font-medium text-slate-100">Linha {index + 1}:</span> {line.why}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sequência: ordenar etapas

export function SequenceMechanic({ level, solved, onMistake, onSolved }: MechanicProps<SequenceLevel>) {
  const [order, setOrder] = useState(() => seededShuffle(level.steps, level.id));
  const [checked, setChecked] = useState(false);

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    setOrder((o) => {
      const next = [...o];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setChecked(false);
  };

  const correctAt = (index: number) => order[index].id === level.steps[index].id;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-300">{level.instruction}</p>
      <ol className="space-y-2">
        {order.map((step, index) => {
          const state = solved || checked ? (correctAt(index) ? 'ok' : 'bad') : 'idle';
          return (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                state === 'ok'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-50'
                  : state === 'bad'
                    ? 'border-rose-400/40 bg-rose-500/10 text-rose-50'
                    : 'border-slate-700 bg-slate-900/70 text-slate-200'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs text-slate-300">{index + 1}</span>
              <span className="flex-1">{step.text}</span>
              {!solved ? (
                <span className="flex shrink-0 flex-col gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Mover para cima" className="rounded-md border border-slate-700 p-1 hover:border-cyan-400/60 disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label="Mover para baixo" className="rounded-md border border-slate-700 p-1 hover:border-cyan-400/60 disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </span>
              ) : (
                <Check className="h-4 w-4 shrink-0 text-emerald-300" />
              )}
            </li>
          );
        })}
      </ol>
      {!solved ? (
        <button
          type="button"
          onClick={() => {
            const ok = order.every((_, i) => correctAt(i));
            setChecked(true);
            if (ok) onSolved();
            else onMistake();
          }}
          className={primaryButton}
        >
          <Check className="h-4 w-4" />
          Verificar ordem
        </button>
      ) : null}
      {checked && !solved ? (
        <Feedback tone="error">
          <span className="inline-flex items-center gap-2">
            <X className="h-4 w-4" />
            {order.filter((_, i) => !correctAt(i)).length} etapas fora de posição (em vermelho). Ajuste e verifique de novo.
          </span>
        </Feedback>
      ) : null}
    </div>
  );
}
