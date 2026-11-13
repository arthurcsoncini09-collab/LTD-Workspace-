'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// A folha do certificado, em tamanho A4 paisagem (297 × 210 mm).
// Na tela aparece reduzida para caber; na impressão, uma cópia em tamanho real é a
// única coisa na página (veja .cert-print-root em globals.css).

export type CertificateData = {
  kind: 'module' | 'trail';
  name: string;
  /** "Módulo 05 · Subnetting" ou o nome da trilha. */
  heading: string;
  /** Texto principal depois do nome. */
  statement: string;
  /** Conteúdo estudado (títulos das aulas ou dos módulos). */
  topics: string[];
  /** Número no selo (o do módulo, ou 20 na trilha). */
  seal: string;
  sealLabel: string;
  issuedOn: string;
  code: string;
};

const SERIF = "Georgia, 'Times New Roman', serif";

function Sheet({ data }: { data: CertificateData }) {
  const isTrail = data.kind === 'trail';
  return (
    <div
      style={{ width: '297mm', height: '210mm', fontFamily: 'Inter, system-ui, sans-serif', background: '#fdfbf5', color: '#1e293b' }}
      className="relative overflow-hidden"
    >
      {/* Faixas decorativas */}
      <div className="absolute inset-y-0 left-0" style={{ width: '14mm', background: 'linear-gradient(180deg,#1e3a8a,#2563eb 55%,#0891b2)' }} />
      <div className="absolute inset-y-0" style={{ left: '14mm', width: '1.6mm', background: '#c9a227' }} />
      <div
        className="absolute"
        style={{ right: '-40mm', top: '-40mm', width: '120mm', height: '120mm', borderRadius: '50%', border: '0.6mm solid #e2e8f0' }}
      />
      <div
        className="absolute"
        style={{ right: '-25mm', top: '-25mm', width: '90mm', height: '90mm', borderRadius: '50%', border: '0.6mm solid #e2e8f0' }}
      />

      <div className="absolute flex flex-col" style={{ left: '30mm', right: '18mm', top: '16mm', bottom: '14mm' }}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: '3mm' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/netlearn-emblem.png" alt="" style={{ width: '14mm', height: '14mm' }} />
            <div>
              <div style={{ fontSize: '17pt', fontWeight: 800, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#0f172a' }}>Net</span>
                <span style={{ color: '#2b8ae6' }}>Learn</span>
              </div>
              <div style={{ fontSize: '8pt', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fundamentos de Redes</div>
            </div>
          </div>
          <div style={{ fontSize: '8pt', color: '#64748b', textAlign: 'right' }}>
            Código do certificado
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '10pt', color: '#1e293b', letterSpacing: '0.06em' }}>{data.code}</div>
          </div>
        </div>

        {/* Título */}
        <div style={{ marginTop: '11mm' }}>
          <div style={{ fontFamily: SERIF, fontSize: '34pt', letterSpacing: '0.18em', color: '#1e3a8a', lineHeight: 1 }}>CERTIFICADO</div>
          <div style={{ marginTop: '2.5mm', fontSize: '11pt', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#a16207' }}>
            {isTrail ? 'de conclusão da trilha' : 'de conclusão de módulo'}
          </div>
        </div>

        {/* Nome e texto */}
        <div style={{ marginTop: '9mm', fontSize: '11pt', color: '#475569' }}>Certificamos que</div>
        <div
          style={{
            marginTop: '2mm',
            fontFamily: SERIF,
            fontSize: data.name.length > 34 ? '24pt' : '30pt',
            fontStyle: 'italic',
            color: '#0f172a',
            borderBottom: '0.4mm solid #c9a227',
            paddingBottom: '2mm',
            maxWidth: '190mm',
          }}
        >
          {data.name}
        </div>
        <p style={{ marginTop: '5mm', fontSize: '11.5pt', lineHeight: 1.55, maxWidth: '215mm', color: '#334155' }}>
          {data.statement}
        </p>

        {/* Conteúdo estudado */}
        <div style={{ marginTop: '5mm', maxWidth: '230mm' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
            {isTrail ? 'Módulos concluídos' : 'Conteúdo estudado'}
          </div>
          <div
            style={{
              marginTop: '1.5mm',
              fontSize: isTrail ? '7.5pt' : '9pt',
              lineHeight: 1.5,
              color: '#475569',
              columnCount: isTrail ? 3 : undefined,
              columnGap: '6mm',
            }}
          >
            {isTrail ? (
              data.topics.map((t) => <div key={t}>{t}</div>)
            ) : (
              <span>{data.topics.join('  ·  ')}</span>
            )}
          </div>
        </div>

        {/* Rodapé: data, selo e assinatura */}
        <div className="mt-auto flex items-end justify-between">
          <div style={{ fontSize: '10pt', color: '#334155' }}>
            <div style={{ fontSize: '8pt', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Emitido em</div>
            <div style={{ marginTop: '1mm' }}>{data.issuedOn}</div>
          </div>

          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: '30mm',
              height: '30mm',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #fde68a, #d4a017 60%, #a16207)',
              boxShadow: '0 0 0 1.2mm #fdfbf5, 0 0 0 1.8mm #c9a227',
              color: '#422006',
            }}
          >
            <div style={{ fontSize: '6.5pt', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{data.sealLabel}</div>
            <div style={{ fontFamily: SERIF, fontSize: '20pt', fontWeight: 700, lineHeight: 1.1 }}>{data.seal}</div>
            <div style={{ fontSize: '6pt', letterSpacing: '0.14em', textTransform: 'uppercase' }}>NetLearn</div>
          </div>

          <div style={{ textAlign: 'center', width: '70mm' }}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15pt', color: '#1e3a8a' }}>NetLearn</div>
            <div style={{ borderTop: '0.3mm solid #94a3b8', marginTop: '1.5mm', paddingTop: '1.5mm', fontSize: '8.5pt', color: '#475569' }}>
              Plataforma de ensino de redes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Certificado reduzido para caber na largura disponível, mais a cópia para impressão. */
export function CertificateSheet({ data }: { data: CertificateData }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const box = boxRef.current;
    if (!box) return;
    // 297 mm ≈ 1122.5 px a 96 dpi.
    const update = () => setScale(Math.min(1, box.clientWidth / 1122.5));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={boxRef} className="w-full">
        <div style={{ height: 793.7 * scale }} className="relative overflow-hidden rounded-lg shadow-2xl shadow-black/50 ring-1 ring-slate-700">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} className="absolute left-0 top-0">
            <Sheet data={data} />
          </div>
        </div>
      </div>
      {mounted
        ? createPortal(
            <div className="cert-print-root">
              <Sheet data={data} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
