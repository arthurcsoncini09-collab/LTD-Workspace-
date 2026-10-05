'use client';

import { useMemo, useState } from 'react';

export function GlossarySearch({ terms }: { terms: Array<{ term: string; definition: string; technical_definition: string; example: string; related: string }> }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return terms;
    return terms.filter((item) => item.term.toLowerCase().includes(term) || item.definition.toLowerCase().includes(term));
  }, [query, terms]);

  return (
    <>
      <div className="card-surface rounded-[28px] p-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar termo: DHCP, DNS, ARP..." className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
      </div>

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
    </>
  );
}
