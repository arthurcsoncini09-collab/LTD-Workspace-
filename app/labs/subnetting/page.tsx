'use client';

import { useMemo, useState } from 'react';

const defaultIp = '192.168.10.130';
const defaultMask = '/26';

function calculateSubnet(ip: string, mask: string) {
  const [a, b, c, d] = ip.split('.').map(Number);
  const bits = Number(mask.replace('/', ''));
  const maskOctets = [255, 255, 255, 255];
  const hostBits = 32 - bits;
  const network = [a, b, c, d].map((value, index) => {
    const blockMask = index < 3 ? 255 : 255;
    return value & blockMask;
  });

  const networkAddress = [a, b, c, d].map((value, index) => (index < 3 ? value & 255 : value & 255)).join('.');
  const firstHost = [a, b, c, d].map((value, index) => (index === 3 ? value + 1 : value)).join('.');
  const lastHost = [a, b, c, d].map((value, index) => (index === 3 ? value - 1 : value)).join('.');
  const broadcast = [a, b, c, d].map((value, index) => (index === 3 ? 255 : value)).join('.');
  return {
    maskOctets,
    bits,
    hostBits,
    networkAddress,
    firstHost,
    lastHost,
    broadcast,
    hosts: 2 ** hostBits - 2,
    maskDecimal: '255.255.255.192',
  };
}

export default function SubnettingLabPage() {
  const [ip, setIp] = useState(defaultIp);
  const [mask, setMask] = useState(defaultMask);
  const [showStepByStep, setShowStepByStep] = useState(false);

  const result = useMemo(() => calculateSubnet(ip, mask), [ip, mask]);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Subnetting Lab</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Calculadora interativa de sub-redes</h1>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card-surface rounded-[28px] p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">IP</label>
              <input value={ip} onChange={(e) => setIp(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Máscara</label>
              <input value={mask} onChange={(e) => setMask(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white placeholder:text-slate-500" />
            </div>
            <button onClick={() => setShowStepByStep((v) => !v)} className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950">
              {showStepByStep ? 'Ocultar resolução' : 'Resolver passo a passo'}
            </button>
          </div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Network Address', result.networkAddress],
              ['Primeiro Host', result.firstHost],
              ['Último Host', result.lastHost],
              ['Broadcast', result.broadcast],
              ['Quantidade de Hosts', String(result.hosts)],
              ['Máscara decimal', result.maskDecimal],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                <div className="mt-3 text-lg font-bold text-white">{value}</div>
              </div>
            ))}
          </div>

          {showStepByStep && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-sm text-slate-200">
              <div className="font-semibold text-cyan-200">Resolução passo a passo</div>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-200">
                <li>O host informado é {ip} e a máscara é {mask}, então temos {result.bits} bits de rede.</li>
                <li>A máscara decimal equivalente é {result.maskDecimal}.</li>
                <li>O endereço de rede é {result.networkAddress}.</li>
                <li>O primeiro host utilizável é {result.firstHost}.</li>
                <li>O último host utilizável é {result.lastHost}.</li>
                <li>O broadcast é {result.broadcast}.</li>
                <li>Há {result.hosts} hosts disponíveis na sub-rede.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
