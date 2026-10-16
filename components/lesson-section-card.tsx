import { Lightbulb } from 'lucide-react';
import type { LessonSection, SectionTable } from '@/lib/content/types';

export function DataTable({ table }: { table: SectionTable }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.08em] text-cyan-200">
          <tr>
            {table.headers.map((header) => (
              <th key={header} scope="col" className="px-3 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-800 odd:bg-slate-950/40">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`px-3 py-2 align-top ${cellIndex === 0 ? 'font-medium text-slate-100' : 'text-slate-300'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      {label ? <div className="border-b border-slate-800 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div> : null}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-emerald-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionBody({ section }: { section: LessonSection }) {
  return (
    <>
      {section.content ? <p className="leading-relaxed text-slate-300">{section.content}</p> : null}

      {section.items ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {section.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.steps ? (
        <ol className="mt-3 space-y-2 text-sm text-slate-300">
          {section.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-semibold text-cyan-200">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {section.table ? <DataTable table={section.table} /> : null}
      {section.code ? <CodeBlock code={section.code} /> : null}
      {section.example ? <div className="mt-3 text-sm text-cyan-200">Exemplo: {section.example}</div> : null}
    </>
  );
}

/** Seções com tabela ou código ocupam a largura toda para não espremer o conteúdo. */
export function isWideSection(section: LessonSection) {
  return Boolean(section.table || section.code);
}

export function LessonSectionCard({ section }: { section: LessonSection }) {
  const wide = isWideSection(section) ? 'lg:col-span-2' : '';

  if (section.collapsed) {
    return (
      <details className={`group min-w-0 rounded-[24px] border border-amber-500/30 bg-amber-500/5 p-5 ${wide}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-amber-200">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
            <Lightbulb className="h-4 w-4" />
            {section.title}
          </span>
          <span className="text-xs text-amber-300/80 group-open:hidden">Clique para revelar</span>
        </summary>
        <div className="mt-4">
          <SectionBody section={section} />
        </div>
      </details>
    );
  }

  return (
    <article className={`min-w-0 rounded-[24px] border border-slate-800 bg-slate-950/50 p-5 ${wide}`}>
      <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
        <Lightbulb className="h-4 w-4" />
        {section.title}
      </h3>
      <SectionBody section={section} />
    </article>
  );
}
