'use client';

import { useMemo, useState } from 'react';

type Term = { term: string; definition: string; technical_definition: string; example: string; related: string };

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function GlossarySearch({ terms, initialQuery = '' }: { terms: Term[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return terms;
    return terms.filter((item) => [item.term, item.definition, item.technical_definition, item.related].some((field) => normalize(field).includes(needle)));
  }, [query, terms]);

  return (
    <>
      <div className="card-surface rounded-[28px] p-6">
        <label htmlFor="glossary-search" className="sr-only">
          Buscar termo
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar termo: DHCP, DNS, ARP..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500"
        />
        <div className="mt-3 text-sm text-slate-400" aria-live="polite">
          {filtered.length} de {terms.length} termos
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface rounded-[28px] p-6 text-slate-300">Nenhum termo encontrado para &quot;{query}&quot;.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map(({ term, definition, example, technical_definition, related }) => (
            <div key={term} className="card-surface rounded-[28px] p-5">
              <div className="mb-3 text-xl font-bold text-white">{term}</div>
              <p className="text-sm leading-relaxed text-slate-300">{definition}</p>
              <div className="mt-3 text-xs uppercase tracking-[0.12em] text-slate-400">{technical_definition}</div>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-cyan-200">Exemplo: {example}</div>
              <div className="mt-3 text-xs text-slate-400">Relaciona-se com: {related}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
