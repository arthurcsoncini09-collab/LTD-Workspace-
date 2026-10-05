'use client';

import { useState } from 'react';

const commandResults: Record<string, string> = {
  ping: 'PING 8.8.8.8 (8.8.8.8): 32 bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12ms',
  ipconfig: 'Windows IP Configuration\nEthernet adapter Ethernet:\nIPv4 Address . . . . . . . . . . : 192.168.1.10\nDefault Gateway . . . . . . . . . : 192.168.1.1',
  tracert: 'Tracing route to 8.8.8.8 over a maximum of 30 hops:\n1 192.168.1.1 1 ms 1 ms 1 ms',
  nslookup: 'Server:  dns.local\nAddress: 192.168.1.1\nName: www.exemplo.com\nAddress: 93.184.216.34',
  arp: 'Interface: 192.168.1.10 --- 0x3\nInternet Address  Physical Address\n192.168.1.1  00-1a-2b-3c-4d-5e',
  netstat: 'Proto Local Address Foreign Address State\nTCP 192.168.1.10:54677 8.8.8.8:443 ESTABLISHED',
};

export default function TerminalPage() {
  const [input, setInput] = useState('ping 8.8.8.8');
  const [history, setHistory] = useState<string[]>([
    '> ping 8.8.8.8',
    'PING 8.8.8.8 (8.8.8.8): 32 bytes of data.',
    '64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12ms',
    'O ping simula a comunicação com um host remoto e ajuda a verificar conectividade.',
  ]);

  const runCommand = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const result = commandResults[trimmed.split(' ')[0].toLowerCase()] ?? 'Comando simulado: procedimento educativo em andamento.';
    setHistory((prev) => [...prev, `> ${trimmed}`, result, 'Explicação: esse comando verifica conectividade, resolução ou roteamento de forma didática.']);
  };

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Terminal educacional</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Laboratório de comandos de rede</h1>
      </section>

      <div className="card-surface rounded-[28px] p-6">
        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm text-slate-200">
          {history.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap py-1">{line}</div>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 font-mono text-sm text-white"
            placeholder="Digite: ping 8.8.8.8"
          />
          <button onClick={runCommand} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
            Executar
          </button>
        </div>
      </div>
    </div>
  );
}
