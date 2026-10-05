import Link from 'next/link';
import { ArrowRight, BookOpen, Cpu, Globe, Shield, Wifi, Rocket, Router, Server, Network, Layers3 } from 'lucide-react';

const featureCards = [
  { title: 'Redes', icon: Network, text: 'Entenda LAN, WAN, Internet e protocolos de forma visual.' },
  { title: 'TCP/IP', icon: Layers3, text: 'Descubra como pacotes viajam em camadas e em cada etapa.' },
  { title: 'IPv4 & Subnetting', icon: Cpu, text: 'Aprenda endereços, máscara, rede e broadcast sem mistério.' },
  { title: 'DNS', icon: Globe, text: 'Veja como o domínio vira IP e como a conexão começa.' },
  { title: 'DHCP', icon: Wifi, text: 'Observe a negociação de IP, gateway e configurações da rede.' },
  { title: 'Switches', icon: Router, text: 'Entenda a tabela MAC e como o switch encaminha quadros.' },
  { title: 'Roteadores', icon: Server, text: 'Explore tabela de rotas, gateway e redes diferentes.' },
  { title: 'Firewalls', icon: Shield, text: 'Veja regras de permissão e bloqueio em ação.' },
];

const labs = ['Subnetting Lab', 'Packet Journey', 'Network Simulator', 'Terminal Lab'];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-glow sm:p-8 lg:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              <Rocket className="h-3.5 w-3.5" />
              Aprenda redes do zero
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Aprenda Redes. Entenda a Internet. Construa sua base em TI.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Aprenda fundamentos de redes gratuitamente com aulas interativas, simuladores, laboratórios e desafios práticos.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 shadow-glow transition hover:scale-[1.01]">
                Começar gratuitamente
              </Link>
              <Link href="/aprender" className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500">
                Explorar o curso
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-8 text-sm text-slate-400">
              <span>4.8/5 avaliações</span>
              <span>100% gratuito</span>
              <span>+12 laboratórios</span>
            </div>
          </div>

          <div className="relative">
            <div className="card-surface neon-border relative rounded-[28px] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Curso</div>
                  <div className="mt-2 text-2xl font-bold">Fundamentos de Redes</div>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">82% progress</div>
              </div>
              <div className="space-y-4">
                {[
                  'Introdução às Redes',
                  'Modelo OSI',
                  'IPv4 e Subnetting',
                  'DNS e DHCP',
                  'Switch e Router',
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-200">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-sm text-slate-200">{item}</div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Do zero aos fundamentos</div>
            <h2 className="mt-2 text-3xl font-bold text-white">Path de aprendizado em rede</h2>
          </div>
          <Link href="/trilha" className="text-sm text-blue-300 hover:text-blue-200">Ver trilha completa →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map(({ title, text, icon: Icon }) => (
            <div key={title} className="card-surface rounded-2xl p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-xl font-semibold text-white">{title}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Aprenda fazendo</div>
          <h2 className="mt-2 text-3xl font-bold text-white">Laboratórios interativos</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {labs.map((lab) => (
            <div className="card-surface rounded-2xl p-5" key={lab}>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-xl font-semibold text-white">{lab}</div>
              <p className="mt-3 text-sm text-slate-300">Simulação prática para visualizar a rede em ação e aplicar conceitos reais.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface rounded-[28px] p-8">
        <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">100% gratuito</div>
            <h2 className="mt-2 text-3xl font-bold text-white">O conhecimento deve ser acessível.</h2>
          </div>
          <Link href="/dashboard" className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-950">
            Acessar dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
