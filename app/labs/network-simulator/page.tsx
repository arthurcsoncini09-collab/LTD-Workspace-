'use client';

import { useState } from 'react';

const devices = [
  { id: 'PC1', label: 'PC1', x: '10%', y: '40%' },
  { id: 'PC2', label: 'PC2', x: '40%', y: '20%' },
  { id: 'Switch', label: 'Switch', x: '50%', y: '50%' },
  { id: 'Router', label: 'Router', x: '75%', y: '40%' },
  { id: 'Server', label: 'Server', x: '90%', y: '70%' },
];

export default function NetworkSimulatorPage() {
  const [pinging, setPinging] = useState(false);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Mini Lab de Rede</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Simulador de rede</h1>
      </section>

      <div className="card-surface rounded-[28px] p-6">
        <div className="mb-5 flex flex-wrap gap-3">
          <button onClick={() => setPinging((v) => !v)} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
            {pinging ? 'Parar ping' : 'PING'}
          </button>
          <button className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-200">Configurar IP</button>
        </div>

        <div className="relative h-[420px] overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/60">
          <div className="absolute inset-0 bg-grid opacity-50" />
          {devices.map(({ id, label, x, y }) => (
            <div key={id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: x, top: y }}>
              <div className="mb-2 h-14 w-14 rounded-2xl border border-blue-500/40 bg-blue-500/10 text-center text-xs font-semibold text-cyan-200 flex items-center justify-center">
                {label}
              </div>
            </div>
          ))}

          <div className="absolute left-[18%] top-[43%] h-px w-[24%] bg-cyan-400" />
          <div className="absolute left-[30%] top-[30%] h-[18%] w-px bg-cyan-400" />
          <div className="absolute left-[58%] top-[44%] h-px w-[18%] bg-cyan-400" />
          <div className="absolute left-[72%] top-[52%] h-[18%] w-px bg-cyan-400" />

          {pinging && (
            <div className="absolute left-[10%] top-[45%] h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
