'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const journey = [
  { title: 'Aplicação cria a requisição', layer: '7 — Aplicação', module: 'http-https', text: 'Você digita https://example.com. O navegador prepara uma requisição HTTP GET para o caminho "/".' },
  { title: 'DNS resolve o domínio', layer: '7 — Aplicação', module: 'dns', text: 'Antes de conectar, é preciso o IP. O sistema consulta o cache e depois o resolvedor DNS, que devolve o endereço de example.com.' },
  { title: 'TCP cria a conexão', layer: '4 — Transporte', module: 'tcp-udp', text: 'Three-way handshake com a porta 443: SYN, SYN-ACK, ACK. Uma porta efêmera (ex.: 51544) é usada como origem.' },
  { title: 'TLS protege a sessão', layer: '6/7 — Apresentação/Aplicação', module: 'http-https', text: 'Cliente e servidor negociam a criptografia e o navegador valida o certificado do site.' },
  { title: 'Segmentação', layer: '4 — Transporte', module: 'tcp-udp', text: 'Os dados são divididos em segmentos de até ~1460 bytes, numerados para serem remontados na ordem certa.' },
  { title: 'IP define o destino', layer: '3 — Rede', module: 'ipv4', text: 'Cada segmento ganha um cabeçalho IP com origem 192.168.1.10 e destino no IP do servidor. Como o destino é de outra rede, o próximo salto é o gateway.' },
  { title: 'ARP descobre o MAC do gateway', layer: '2 — Enlace', module: 'mac-e-arp', text: 'Para montar o quadro Ethernet é preciso o MAC do gateway 192.168.1.1. Se não estiver no cache, um ARP Request é enviado em broadcast.' },
  { title: 'Switch encaminha o quadro', layer: '2 — Enlace', module: 'switch', text: 'O switch consulta a tabela MAC e entrega o quadro somente na porta onde está o roteador.' },
  { title: 'Router consulta a tabela de rotas', layer: '3 — Rede', module: 'router', text: 'O roteador lê o IP de destino, aplica o longest prefix match e usa a rota padrão rumo ao provedor. O TTL é decrementado.' },
  { title: 'NAT traduz o endereço', layer: '3/4 — Rede/Transporte', module: 'nat-e-pat', text: 'O IP privado 192.168.1.10:51544 é trocado pelo IP público do roteador (PAT) e a tradução fica registrada na tabela de NAT.' },
  { title: 'Pacote cruza a Internet', layer: '3 — Rede', module: 'router', text: 'Vários roteadores de diferentes provedores (sistemas autônomos, conectados via BGP) encaminham o pacote até a rede do servidor.' },
  { title: 'Firewall do servidor avalia', layer: '3 a 7', module: 'firewall', text: 'Na entrada do data center, o firewall verifica se a porta 443 é permitida para aquele servidor.' },
  { title: 'Servidor recebe e responde', layer: '7 → 1', module: 'http-https', text: 'O servidor desencapsula camada a camada, processa o GET e responde 200 OK com o HTML.' },
  { title: 'Processo inverso acontece', layer: '1 → 7', module: 'modelo-osi', text: 'A resposta faz o caminho de volta: o NAT desfaz a tradução, o switch entrega ao seu PC e o navegador renderiza a página.' },
];

export default function PacketJourneyPage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = journey[step];

  useEffect(() => {
    if (!playing) return;
    if (step >= journey.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStep((s) => s + 1), 2500);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Packet Journey</div>
        <h1 className="mt-3 text-3xl font-bold text-white">A viagem do pacote pela rede</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Acompanhe, etapa por etapa, tudo o que acontece quando você abre um site. Clique em uma etapa ou use os controles.</p>
      </section>

      <div className="card-surface rounded-[28px] p-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
          <span>
            Etapa {step + 1} de {journey.length}
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-cyan-200">Camada {current.layer}</span>
        </div>
        <div className="progress-bar mb-6">
          <span style={{ width: `${((step + 1) / journey.length) * 100}%` }} />
        </div>
        <h2 className="text-2xl font-bold text-white">{current.title}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-200" aria-live="polite">
          {current.text}
        </p>
        <Link href={`/aulas/${current.module}`} className="mt-3 inline-block text-sm text-cyan-300 hover:text-cyan-200">
          Estudar este tema →
        </Link>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <button
            type="button"
            onClick={() => {
              if (step >= journey.length - 1) setStep(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'Pausar' : 'Reproduzir'}
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(journey.length - 1, s + 1))}
            disabled={step === journey.length - 1}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-100 disabled:opacity-40"
          >
            Próxima <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="card-surface rounded-[28px] p-6">
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {journey.map((item, index) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => {
                  setStep(index);
                  setPlaying(false);
                }}
                aria-current={index === step ? 'step' : undefined}
                className={`h-full w-full rounded-2xl border p-4 text-left transition ${
                  index === step
                    ? 'border-cyan-400/60 bg-cyan-500/10'
                    : index < step
                      ? 'border-emerald-500/30 bg-slate-950/60'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                }`}
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 font-bold text-slate-950">{index + 1}</div>
                <div className="text-slate-200">{item.title}</div>
                <div className="mt-1 text-xs text-slate-400">Camada {item.layer}</div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
