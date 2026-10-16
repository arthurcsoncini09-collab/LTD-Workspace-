import Link from 'next/link';
import { Search } from 'lucide-react';
import { searchContent } from '@/lib/netlearn-db';

const labs = [
  { title: 'Subnetting Lab', href: '/labs/subnetting', keywords: 'subnetting sub-rede máscara cidr calculadora broadcast' },
  { title: 'Packet Journey', href: '/labs/packet-journey', keywords: 'pacote viagem encapsulamento jornada' },
  { title: 'Network Simulator', href: '/labs/network-simulator', keywords: 'simulador ping gateway topologia' },
  { title: 'Terminal Lab', href: '/terminal', keywords: 'terminal comandos ping tracert nslookup arp netstat ipconfig' },
];

export default function BuscaPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const results = query ? searchContent(query) : [];
  const lower = query.toLowerCase();
  const labResults = query ? labs.filter((lab) => `${lab.title} ${lab.keywords}`.toLowerCase().includes(lower)) : [];
  const total = results.length + labResults.length;

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Busca</div>
        <h1 className="mt-3 text-3xl font-bold text-white">{query ? `Resultados para "${query}"` : 'Buscar no NetLearn'}</h1>
        <form action="/busca" role="search" className="mt-5 flex gap-3">
          <label htmlFor="busca-q" className="sr-only">
            Termo de busca
          </label>
          <input
            id="busca-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Ex.: DHCP, handshake, VLAN, 443…"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500"
          />
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </form>
        {query ? <p className="mt-3 text-sm text-slate-400">{total} resultado(s)</p> : null}
      </section>

      {query && total === 0 ? (
        <div className="card-surface rounded-[28px] p-6 text-slate-300">
          Nada encontrado. Tente um termo mais curto ou veja a{' '}
          <Link href="/trilha" className="text-cyan-300 hover:text-cyan-200">
            trilha completa
          </Link>
          .
        </div>
      ) : null}

      <ul className="space-y-4">
        {labResults.map((lab) => (
          <li key={lab.href}>
            <Link href={lab.href} className="card-surface block rounded-[24px] p-5 transition hover:border-cyan-400/50">
              <span className="text-xs uppercase tracking-[0.2em] text-violet-300">laboratório</span>
              <div className="mt-1 text-lg font-semibold text-white">{lab.title}</div>
            </Link>
          </li>
        ))}
        {results.map((result) => (
          <li key={`${result.type}-${result.href}`}>
            <Link href={result.href} className="card-surface block rounded-[24px] p-5 transition hover:border-cyan-400/50">
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">{result.type}</span>
              <div className="mt-1 text-lg font-semibold text-white">{result.title}</div>
              <p className="mt-1 text-sm text-slate-400">{result.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
