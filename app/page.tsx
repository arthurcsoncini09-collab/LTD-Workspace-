import Link from 'next/link';
import { ArrowRight, Check, Cpu, Gamepad2, Globe, Layers3, Network, Route, Router, Server, Shield, TerminalSquare, Wifi } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eyebrow } from '@/components/ui/card';

const featureCards = [
  { title: 'Redes', icon: Network, href: '/aulas/introducao-redes', text: 'Entenda LAN, WAN, Internet e protocolos de forma visual.' },
  { title: 'TCP/IP', icon: Layers3, href: '/aulas/tcp-ip', text: 'Descubra como pacotes viajam em camadas e em cada etapa.' },
  { title: 'IPv4 & Subnetting', icon: Cpu, href: '/aulas/subnetting', text: 'Aprenda endereços, máscara, rede e broadcast sem mistério.' },
  { title: 'DNS', icon: Globe, href: '/aulas/dns', text: 'Veja como o domínio vira IP e como a conexão começa.' },
  { title: 'DHCP', icon: Wifi, href: '/aulas/dhcp', text: 'Observe a negociação de IP, gateway e configurações da rede.' },
  { title: 'Switches', icon: Router, href: '/aulas/switch', text: 'Entenda a tabela MAC e como o switch encaminha quadros.' },
  { title: 'Roteadores', icon: Server, href: '/aulas/router', text: 'Explore tabela de rotas, gateway e redes diferentes.' },
  { title: 'Firewalls', icon: Shield, href: '/aulas/firewall', text: 'Veja regras de permissão e bloqueio em ação.' },
];

const labs = [
  { title: 'Subnetting Lab', href: '/labs/subnetting', icon: Layers3, text: 'Calcule rede, broadcast e hosts com resolução passo a passo.' },
  { title: 'Packet Journey', href: '/labs/packet-journey', icon: Route, text: 'Acompanhe cada etapa da viagem de um pacote pela Internet.' },
  { title: 'Network Simulator', href: '/labs/network-simulator', icon: Network, text: 'Configure IP e gateway e descubra por que o ping falha.' },
  { title: 'Terminal Lab', href: '/terminal', icon: TerminalSquare, text: 'Pratique ping, tracert, nslookup e arp com explicações.' },
];

const stats = [
  { value: '20', label: 'módulos' },
  { value: '4', label: 'laboratórios' },
  { value: '15', label: 'fases de simulação' },
  { value: '100%', label: 'gratuito' },
];

const preview = [
  { title: 'Introdução às Redes', slug: 'introducao-redes' },
  { title: 'Modelo OSI', slug: 'modelo-osi' },
  { title: 'IPv4 e Subnetting', slug: 'subnetting' },
  { title: 'DNS e DHCP', slug: 'dns' },
  { title: 'Switch e Router', slug: 'switch' },
];

function SectionHeading({ eyebrow, title, description, href, linkLabel }: { eyebrow: string; title: string; description: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300">
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-20 pb-12">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" aria-hidden />
        <div className="relative grid items-center gap-12 p-6 sm:p-10 lg:grid-cols-[1.25fr_0.75fr] lg:p-14">
          <div>
            <Badge tone="blue" className="mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Novo: simulação de carreira em TI
            </Badge>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              Aprenda redes de computadores <span className="text-slate-400">do zero, na prática.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Aulas objetivas, laboratórios interativos e chamados simulados para você construir uma base sólida em TI — no seu ritmo e sem custo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" size="lg">
                Começar gratuitamente
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/aprender" variant="outline" size="lg">
                Explorar o curso
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              {['Sem cadastro obrigatório', 'Progresso salvo', 'Conteúdo em português'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-background/80 p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Curso</div>
                <div className="mt-0.5 font-semibold text-white">Fundamentos de Redes</div>
              </div>
              <Badge tone="green">20 módulos</Badge>
            </div>
            <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {preview.map((item, index) => (
                <li key={item.slug}>
                  <Link href={`/aulas/${item.slug}`} className="group flex items-center gap-3 bg-card px-3 py-2.5 transition-colors hover:bg-muted">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-xs font-medium text-slate-400">{index + 1}</span>
                    <span className="flex-1 text-sm text-slate-200">{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
                  </Link>
                </li>
              ))}
            </ol>
            <Link href="/trilha" className="mt-3 block text-center text-xs font-medium text-slate-400 hover:text-slate-200">
              + 15 módulos na trilha completa
            </Link>
          </div>
        </div>

        <dl className="relative grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-5">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Conteúdo"
          title="Do básico ao avançado, em ordem"
          description="Cada tema tem aula, exemplos reais e quiz para fixar."
          href="/trilha"
          linkLabel="Ver trilha completa"
        />
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map(({ title, text, href, icon: Icon }) => (
            <Link key={title} href={href} className="group bg-card p-6 transition-colors hover:bg-muted/60">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-blue-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-white">
                {title}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Prática"
          title="Laboratórios interativos"
          description="Aprenda fazendo: calcule, configure e diagnostique em ambientes simulados."
          href="/labs"
          linkLabel="Todos os laboratórios"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {labs.map(({ title, text, href, icon: Icon }) => (
            <Link href={href} key={title} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-slate-600">
              <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-blue-400" />
              <div className="mt-4 font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid items-center gap-8 rounded-2xl border border-border bg-card p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
        <div className="flex gap-5">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 sm:flex">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Pronto para testar o que aprendeu?</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Na Simulação você atende chamados reais de suporte, redes, segurança, cloud e telecom — e é promovido a cada área concluída.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/simulacao" size="lg">
            Jogar a simulação
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="outline" size="lg">
            Ir para o dashboard
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
