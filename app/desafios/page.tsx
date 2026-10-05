import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';

const desafios = [
  { title: 'Primeiro pacote', description: 'Descubra seu IP, máscara e gateway e identifique a rede à qual seu computador pertence.', difficulty: 'Iniciante', href: '/aulas/ipv4#laboratorio' },
  { title: 'Subnetting Rookie', description: 'Resolva um cenário com máscara /26 e determine rede, broadcast e faixa de hosts — confira no Subnetting Lab.', difficulty: 'Intermediário', href: '/labs/subnetting' },
  { title: 'Detetive de conectividade', description: 'Use o simulador para descobrir por que o PC1 não alcança o servidor em cada cenário com defeito.', difficulty: 'Intermediário', href: '/labs/network-simulator' },
  { title: 'TCP Expert', description: 'Capture um three-way handshake no Wireshark e explique os números de sequência.', difficulty: 'Intermediário', href: '/aulas/tcp-udp#laboratorio' },
  { title: 'Plano VLSM', description: 'Divida 172.16.0.0/22 entre cinco redes de tamanhos diferentes sem sobreposição.', difficulty: 'Avançado', href: '/aulas/subnetting#laboratorio' },
  { title: 'Network Defender', description: 'Crie regras de firewall para LAN, DMZ e Internet e prove com testes que só o permitido passa.', difficulty: 'Avançado', href: '/aulas/firewall#laboratorio' },
];

export default function DesafiosPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Desafios</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Teste prático e conquistas</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Desafios práticos ligados aos laboratórios e aos módulos. Termine com o projeto integrador do Desafio Final.</p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {desafios.map(({ title, description, difficulty, href }) => (
          <Link key={title} href={href} className="card-surface rounded-[28px] p-5 transition hover:-translate-y-1">
            <div className="mb-3 text-sm uppercase tracking-[0.2em] text-cyan-300">{difficulty}</div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
              Começar <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/aulas/desafio-final"
        className="card-surface neon-border flex flex-col gap-4 rounded-[28px] p-6 transition hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 text-slate-950">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-amber-300">Projeto</div>
            <div className="text-2xl font-bold text-white">Desafio Final — a rede da NetLearn Ltda.</div>
            <p className="mt-1 text-sm text-slate-300">VLSM, VLANs, DHCP, DNS, NAT, firewall, VPN e SSH em um único projeto, com rubrica e prova final.</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-cyan-300" />
      </Link>
    </div>
  );
}
