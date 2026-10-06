'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { simulatePing, TOPOLOGY, type NodeId, type PcConfig, type SimResult } from '@/lib/network-sim';

const nodes: Record<NodeId, { label: string; detail: string; x: number; y: number }> = {
  pc1: { label: 'PC1', detail: 'você configura', x: 90, y: 80 },
  pc2: { label: 'PC2', detail: TOPOLOGY.pc2, x: 90, y: 250 },
  switch: { label: 'Switch', detail: 'camada 2', x: 290, y: 165 },
  router: { label: 'Router', detail: `G0/0 ${TOPOLOGY.routerLan}`, x: 500, y: 165 },
  server: { label: 'Servidor', detail: TOPOLOGY.server, x: 710, y: 165 },
};

const links: Array<[NodeId, NodeId]> = [
  ['pc1', 'switch'],
  ['pc2', 'switch'],
  ['switch', 'router'],
  ['router', 'server'],
];

const presets: Array<{ label: string; config: PcConfig }> = [
  { label: 'Configuração correta', config: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' } },
  { label: 'Sem gateway', config: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '' } },
  { label: 'Gateway errado', config: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.254' } },
  { label: 'Rede errada', config: { ip: '192.168.2.10', mask: '255.255.255.0', gateway: '192.168.2.1' } },
  { label: 'Conflito de IP', config: { ip: '192.168.1.20', mask: '255.255.255.0', gateway: '192.168.1.1' } },
];

const STEP_MS = 900;

export default function NetworkSimulatorPage() {
  const [config, setConfig] = useState<PcConfig>(presets[0].config);
  const [result, setResult] = useState<SimResult | null>(null);
  const [visibleSteps, setVisibleSteps] = useState(0);

  const running = result !== null && visibleSteps < result.steps.length;
  const current = result && visibleSteps > 0 ? result.steps[visibleSteps - 1] : null;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setVisibleSteps((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, visibleSteps]);

  const startPing = (target: 'pc2' | 'server') => {
    setResult(simulatePing(config, target));
    setVisibleSteps(1);
  };

  const update = (field: keyof PcConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, [field]: event.target.value }));
    setResult(null);
    setVisibleSteps(0);
  };

  const packet = current ? nodes[current.at] : null;

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Mini Lab de Rede</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Simulador de rede</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Configure o PC1 e faça ping. O pacote percorre a topologia passo a passo — e, se algo estiver errado, o simulador mostra onde e por quê.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="card-surface h-fit space-y-4 rounded-[28px] p-6">
          <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Configurar IP do PC1</h2>
          {(
            [
              ['ip', 'Endereço IP', '192.168.1.10'],
              ['mask', 'Máscara', '255.255.255.0'],
              ['gateway', 'Gateway padrão', '192.168.1.1'],
            ] as const
          ).map(([field, label, placeholder]) => (
            <div key={field}>
              <label htmlFor={`pc1-${field}`} className="mb-1 block text-sm text-slate-300">
                {label}
              </label>
              <input
                id={`pc1-${field}`}
                value={config[field]}
                onChange={update(field)}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-sm text-white placeholder:text-slate-500"
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => startPing('server')}
              disabled={running}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              ping {TOPOLOGY.server}
            </button>
            <button
              type="button"
              onClick={() => startPing('pc2')}
              disabled={running}
              className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 disabled:opacity-50"
            >
              ping {TOPOLOGY.pc2}
            </button>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Cenários prontos</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setConfig(preset.config);
                    setResult(null);
                    setVisibleSteps(0);
                  }}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-cyan-400/60"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card-surface space-y-5 rounded-[28px] p-4 sm:p-6">
          <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950/60">
            <svg viewBox="0 0 800 330" className="h-auto w-full" role="img" aria-label="Topologia: PC1 e PC2 no switch, switch no roteador, roteador no servidor">
              {links.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#22d3ee" strokeOpacity={0.5} strokeWidth={3} />
              ))}
              <text x={395} y={150} textAnchor="middle" className="fill-slate-500 text-[13px]">
                {TOPOLOGY.lanNetwork}
              </text>
              <text x={605} y={150} textAnchor="middle" className="fill-slate-500 text-[13px]">
                10.0.0.0/24
              </text>
              {(Object.keys(nodes) as NodeId[]).map((id) => {
                const node = nodes[id];
                const active = current?.at === id;
                return (
                  <g key={id}>
                    <rect
                      x={node.x - 48}
                      y={node.y - 30}
                      width={96}
                      height={60}
                      rx={16}
                      fill={active ? 'rgba(34,211,238,0.18)' : 'rgba(59,130,246,0.10)'}
                      stroke={active ? '#22d3ee' : 'rgba(59,130,246,0.5)'}
                      strokeWidth={active ? 2.5 : 1.5}
                    />
                    <text x={node.x} y={node.y - 2} textAnchor="middle" className="fill-cyan-100 text-[15px] font-semibold">
                      {node.label}
                    </text>
                    <text x={node.x} y={node.y + 17} textAnchor="middle" className="fill-slate-400 text-[11px]">
                      {id === 'pc1' ? config.ip || '—' : node.detail}
                    </text>
                  </g>
                );
              })}
              {packet ? (
                <circle
                  cx={packet.x}
                  cy={packet.y - 42}
                  r={9}
                  fill={result?.ok || running ? '#34d399' : '#fb7185'}
                  style={{ transition: 'cx 0.6s ease, cy 0.6s ease' }}
                />
              ) : null}
            </svg>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm" role="log" aria-live="polite">
            {!result ? <div className="text-slate-400">Clique em um dos botões de ping para começar.</div> : null}
            {result?.steps.slice(0, visibleSteps).map((step, index) => (
              <div key={index} className="py-0.5 text-slate-200">
                <span className="text-cyan-300">[{nodes[step.at].label}]</span> {step.message}
              </div>
            ))}
          </div>

          {result && !running ? (
            <div
              role="status"
              className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                result.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
              }`}
            >
              {result.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              {result.summary}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
