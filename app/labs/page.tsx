import Link from 'next/link';
import { ArrowRight, Cpu, Globe2, Network, Router, Shield, Wifi } from 'lucide-react';

const labs = [
  { title: 'Subnetting Lab', description: 'Calcule rede, host, broadcast e máscara com explicações passo a passo.', href: '/labs/subnetting', icon: Cpu },
  { title: 'Packet Journey', description: 'Veja a viagem de um pacote da camada de aplicação até a rede física.', href: '/labs/packet-journey', icon: Globe2 },
  { title: 'Network Simulator', description: 'Teste conexões, endereços e rotas em um mini laboratório visual.', href: '/labs/network-simulator', icon: Network },
  { title: 'Terminal Lab', description: 'Simule comandos como ping, arp, nslookup e tracert de forma educativa.', href: '/terminal', icon: Wifi },
];

export default function LabsPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Laboratórios</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Pratique redes de forma visual e ativa</h1>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {labs.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href} className="card-surface rounded-[28px] p-5 transition hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
              Abrir laboratório <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
