const progress = [
  { label: 'Introdução às redes', value: 100 },
  { label: 'OSI', value: 88 },
  { label: 'TCP/IP', value: 72 },
  { label: 'IPv4', value: 63 },
  { label: 'Subnetting', value: 41 },
  { label: 'MAC e ARP', value: 58 },
  { label: 'DNS', value: 35 },
];

export default function ProgressoPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Progresso</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Acompanhamento do seu aprendizado</h1>
      </section>

      <div className="card-surface rounded-[28px] p-6">
        <div className="space-y-6">
          {progress.map(({ label, value }) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
