import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { getModules } from '@/lib/netlearn-db';

export default function AprenderPage() {
  const modules = getModules();

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Aprender</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Trilha de aprendizado em redes</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Tudo começa com conceitos simples e evolui para laboratórios, exercícios e simulações que ajudam a visualizar o que acontece dentro da rede.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {modules.map(({ slug, title, stage, description, accent }) => (
          <Link key={slug} href={`/aulas/${slug}`} className="card-surface rounded-[28px] p-5 transition hover:-translate-y-1">
            <div className={`mb-4 h-2 w-24 rounded-full bg-gradient-to-r ${accent}`} />
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">{stage}</span>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
          </Link>
        ))}
      </div>

      <section className="card-surface rounded-[28px] p-6">
        <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
          <BookOpen className="h-4 w-4" />
          Sequência recomendada
        </div>
        <div className="flex flex-wrap gap-3">
          {['Introdução', 'OSI', 'TCP/IP', 'IPv4', 'Subnetting', 'ARP', 'TCP/UDP', 'DNS', 'DHCP', 'Switch', 'Router', 'Firewall', 'VLAN', 'VPN', 'Desafio final'].map((step) => (
            <span key={step} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">{step}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
