'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { calculateSubnet } from '@/lib/subnet';

const examples = [
  { ip: '192.168.10.130', mask: '/26' },
  { ip: '192.168.1.77', mask: '/27' },
  { ip: '172.16.50.10', mask: '/20' },
  { ip: '10.0.0.5', mask: '255.255.255.252' },
];

export default function SubnettingLabPage() {
  const [ip, setIp] = useState(examples[0].ip);
  const [mask, setMask] = useState(examples[0].mask);
  const [showStepByStep, setShowStepByStep] = useState(false);

  const result = useMemo(() => calculateSubnet(ip, mask), [ip, mask]);
  const ok = !('error' in result);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Subnetting Lab</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Calculadora interativa de sub-redes</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Digite um IP e uma máscara (/26, 26 ou 255.255.255.192) para ver rede, broadcast, faixa de hosts e a resolução passo a passo.</p>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card-surface h-fit rounded-[28px] p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="subnet-ip" className="mb-2 block text-sm text-slate-300">
                Endereço IP
              </label>
              <input
                id="subnet-ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                inputMode="decimal"
                autoComplete="off"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 font-mono text-white placeholder:text-slate-500"
                placeholder="192.168.10.130"
              />
            </div>
            <div>
              <label htmlFor="subnet-mask" className="mb-2 block text-sm text-slate-300">
                Máscara
              </label>
              <input
                id="subnet-mask"
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 font-mono text-white placeholder:text-slate-500"
                placeholder="/26"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowStepByStep((v) => !v)}
              disabled={!ok}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {showStepByStep ? 'Ocultar resolução' : 'Resolver passo a passo'}
            </button>
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Exemplos</div>
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <button
                    key={`${example.ip}${example.mask}`}
                    type="button"
                    onClick={() => {
                      setIp(example.ip);
                      setMask(example.mask);
                    }}
                    className="rounded-full border border-slate-700 px-3 py-1 font-mono text-xs text-slate-300 hover:border-cyan-400/60"
                  >
                    {example.ip}
                    {example.mask.startsWith('/') ? example.mask : ` ${example.mask}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          {!ok ? (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              {result.error}
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ['Endereço de rede', `${result.network}/${result.prefix}`],
                  ['Primeiro host', result.firstHost],
                  ['Último host', result.lastHost],
                  ['Broadcast', result.prefix >= 31 ? '— (não há)' : result.broadcast],
                  ['Hosts utilizáveis', result.usableHosts.toLocaleString('pt-BR')],
                  ['Máscara decimal', result.mask],
                  ['Wildcard', result.wildcard],
                  ['Total de endereços', result.totalAddresses.toLocaleString('pt-BR')],
                  ['Tipo', result.isPrivate ? 'Privado (RFC 1918)' : 'Público / especial'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                    <div className="mt-3 break-all font-mono text-lg font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm">
                <div className="grid min-w-[420px] grid-cols-[90px_1fr] gap-y-1">
                  <span className="text-slate-400">IP</span>
                  <span className="text-slate-200">{result.ipBinary}</span>
                  <span className="text-slate-400">Máscara</span>
                  <span className="text-cyan-200">{result.maskBinary}</span>
                  <span className="text-slate-400">AND</span>
                  <span className="text-emerald-200">{result.networkBinary}</span>
                </div>
              </div>

              {showStepByStep && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-sm text-slate-200">
                  <div className="font-semibold text-cyan-200">Resolução passo a passo</div>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-200">
                    <li>
                      O host é {result.ip} com prefixo /{result.prefix}: {result.prefix} bits de rede e {32 - result.prefix} bits de host.
                    </li>
                    <li>A máscara decimal equivalente é {result.mask}.</li>
                    <li>
                      Octeto interessante: o {result.interestingOctet}º. Número mágico (tamanho do bloco) = 256 − {256 - result.magicNumber} = {result.magicNumber}.
                    </li>
                    <li>
                      O endereço de rede é o múltiplo do bloco que contém o IP (AND entre IP e máscara): {result.network}.
                    </li>
                    {result.prefix < 31 ? (
                      <>
                        <li>O broadcast é o último endereço do bloco: {result.broadcast}.</li>
                        <li>
                          Hosts utilizáveis: de {result.firstHost} a {result.lastHost} → 2^{32 - result.prefix} − 2 = {result.usableHosts.toLocaleString('pt-BR')}.
                        </li>
                      </>
                    ) : (
                      <li>
                        Prefixo /{result.prefix}: caso especial ({result.prefix === 31 ? 'link ponto a ponto, RFC 3021 — os 2 endereços são usáveis' : 'um único host, como uma loopback'}).
                      </li>
                    )}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
