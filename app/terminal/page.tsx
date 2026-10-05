'use client';

import { useEffect, useRef, useState } from 'react';

type CommandSpec = {
  usage: string;
  run: (arg: string) => string;
  explanation: string;
};

const DEFAULT_HOST = '8.8.8.8';
const LOCAL_IP = '192.168.1.10';
const GATEWAY = '192.168.1.1';

/** Endereços fictícios e estáveis para nomes digitados pelo aluno. */
function fakeIp(name: string) {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) return name;
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 250;
  return `203.0.113.${hash + 2}`;
}

const commands: Record<string, CommandSpec> = {
  ping: {
    usage: 'ping <host>',
    run: (arg) => {
      const host = arg || DEFAULT_HOST;
      const ip = fakeIp(host);
      const lines = [12, 13, 11, 14].map((t) => `Resposta de ${ip}: bytes=32 tempo=${t}ms TTL=118`);
      return [`Disparando ${host} [${ip}] com 32 bytes de dados:`, ...lines, '', `Estatísticas do Ping para ${ip}:`, '    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda)'].join('\n');
    },
    explanation: 'O ping envia ICMP Echo Request e mede o tempo até o Echo Reply (RTT). O TTL da resposta indica quantos roteadores o pacote atravessou.',
  },
  ipconfig: {
    usage: 'ipconfig',
    run: () =>
      [
        'Configuração de IP do Windows',
        '',
        'Adaptador Ethernet Ethernet:',
        `   Endereço IPv4. . . . . . . . . . : ${LOCAL_IP}`,
        '   Máscara de Sub-rede . . . . . . . : 255.255.255.0',
        `   Gateway Padrão. . . . . . . . . . : ${GATEWAY}`,
      ].join('\n'),
    explanation: 'Mostra o IP, a máscara e o gateway da máquina. Use ipconfig /all para ver também o MAC, o servidor DHCP e o DNS.',
  },
  tracert: {
    usage: 'tracert <host>',
    run: (arg) => {
      const host = arg || DEFAULT_HOST;
      const ip = fakeIp(host);
      return [
        `Rastreando a rota para ${host} [${ip}] com no máximo 30 saltos:`,
        `  1     1 ms     1 ms     1 ms  ${GATEWAY}`,
        '  2     8 ms     7 ms     8 ms  100.64.0.1',
        '  3    10 ms     9 ms    11 ms  198.51.100.9',
        '  4     *        *        *     Esgotado o tempo limite do pedido.',
        `  5    12 ms    12 ms    13 ms  ${ip}`,
        '',
        'Rastreamento concluído.',
      ].join('\n');
    },
    explanation: 'O tracert envia pacotes com TTL crescente; cada roteador que zera o TTL responde com ICMP Time Exceeded. "* * *" é um roteador que não responde — não necessariamente uma falha.',
  },
  nslookup: {
    usage: 'nslookup <domínio>',
    run: (arg) => {
      const name = arg || 'www.example.com';
      return ['Servidor:  dns.local', `Address:  ${GATEWAY}`, '', 'Não é resposta autoritativa:', `Nome:    ${name}`, `Address:  ${fakeIp(name)}`].join('\n');
    },
    explanation: 'O nslookup consulta o DNS. "Não é resposta autoritativa" significa que a resposta veio do cache do resolvedor, não do servidor dono do domínio.',
  },
  arp: {
    usage: 'arp -a',
    run: () =>
      [
        `Interface: ${LOCAL_IP} --- 0x3`,
        '  Endereço IP           Endereço físico       Tipo',
        `  ${GATEWAY}           00-1a-2b-3c-4d-5e     dinâmico`,
        '  192.168.1.255         ff-ff-ff-ff-ff-ff     estático',
      ].join('\n'),
    explanation: 'A tabela ARP associa IPs da rede local a endereços MAC. Destinos fora da rede nunca aparecem aqui — só o gateway.',
  },
  netstat: {
    usage: 'netstat -an',
    run: () =>
      [
        'Conexões ativas',
        '  Proto  Endereço local          Endereço externo        Estado',
        '  TCP    0.0.0.0:135             0.0.0.0:0               LISTENING',
        `  TCP    ${LOCAL_IP}:54677      93.184.215.14:443       ESTABLISHED`,
        `  TCP    ${LOCAL_IP}:54680      140.82.112.4:443        TIME_WAIT`,
        '  UDP    0.0.0.0:5353            *:*',
      ].join('\n'),
    explanation: 'Lista conexões e portas em escuta. LISTENING = serviço aguardando; ESTABLISHED = conexão ativa; TIME_WAIT = conexão encerrada aguardando liberação.',
  },
  route: {
    usage: 'route print',
    run: () =>
      [
        'Tabela de rotas IPv4',
        'Destino de rede    Máscara          Gateway        Interface',
        `0.0.0.0            0.0.0.0          ${GATEWAY}    ${LOCAL_IP}`,
        `192.168.1.0        255.255.255.0    No vínculo     ${LOCAL_IP}`,
        '127.0.0.0          255.0.0.0        No vínculo     127.0.0.1',
      ].join('\n'),
    explanation: 'A rota 0.0.0.0/0 é a rota padrão: tudo que não é da rede local vai para o gateway.',
  },
};

const aliases: Record<string, string> = { traceroute: 'tracert', dig: 'nslookup', ifconfig: 'ipconfig', ss: 'netstat' };

const HELP = [
  'Comandos disponíveis:',
  ...Object.values(commands).map((spec) => `  ${spec.usage}`),
  '  clear  — limpa a tela',
  '  help   — mostra esta ajuda',
  'Dica: use as setas ↑ e ↓ para navegar no histórico.',
].join('\n');

type Line = { text: string; kind: 'input' | 'output' | 'note' };

export default function TerminalPage() {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { text: 'Terminal educacional NetLearn — saídas simuladas para fins didáticos.', kind: 'note' },
    { text: HELP, kind: 'output' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [lines]);

  const runCommand = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(null);
    setInput('');

    const [rawName, ...rest] = trimmed.split(/\s+/);
    const name = aliases[rawName.toLowerCase()] ?? rawName.toLowerCase();
    // Ignora opções como -a, /all, -n 4 ao extrair o host.
    const arg = rest.filter((token) => !token.startsWith('-') && !token.startsWith('/') && !/^\d+$/.test(token))[0] ?? '';

    if (name === 'clear' || name === 'cls') {
      setLines([]);
      return;
    }

    const prompt: Line = { text: `C:\\> ${trimmed}`, kind: 'input' };
    if (name === 'help') {
      setLines((prev) => [...prev, prompt, { text: HELP, kind: 'output' }]);
      return;
    }

    const spec = commands[name];
    if (!spec) {
      setLines((prev) => [...prev, prompt, { text: `'${rawName}' não é reconhecido neste laboratório. Digite help para ver os comandos.`, kind: 'output' }]);
      return;
    }

    setLines((prev) => [...prev, prompt, { text: spec.run(arg), kind: 'output' }, { text: `💡 ${spec.explanation}`, kind: 'note' }]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter é tratado pelo submit do formulário.
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index]);
    } else if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault();
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(index);
        setInput(history[index]);
      }
    }
  };

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Terminal educacional</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Laboratório de comandos de rede</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Pratique ping, tracert, nslookup, arp, netstat, ipconfig e route. Cada saída vem acompanhada de uma explicação.</p>
      </section>

      <div className="card-surface rounded-[28px] p-4 sm:p-6">
        <div
          ref={outputRef}
          role="log"
          aria-live="polite"
          className="soft-scrollbar mb-4 h-[420px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm"
        >
          {lines.map((line, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap py-1 ${line.kind === 'input' ? 'text-cyan-300' : line.kind === 'note' ? 'font-sans text-amber-200' : 'text-slate-200'}`}
            >
              {line.text}
            </div>
          ))}
        </div>

        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            runCommand();
          }}
        >
          <label htmlFor="terminal-input" className="sr-only">
            Comando
          </label>
          <input
            id="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 font-mono text-sm text-white"
            placeholder="Digite: ping 8.8.8.8"
          />
          <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
            Executar
          </button>
        </form>
      </div>
    </div>
  );
}
