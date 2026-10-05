const steps = [
  'Introdução às Redes',
  'Modelo OSI',
  'TCP/IP',
  'IPv4',
  'Subnetting',
  'MAC e ARP',
  'TCP e UDP',
  'Portas de Rede',
  'DNS',
  'DHCP',
  'HTTP/HTTPS',
  'SSH',
  'ICMP',
  'Switch',
  'Router',
  'NAT e PAT',
  'Firewall',
  'VLAN',
  'VPN',
  'Desafio Final',
];

export default function TrilhaPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Trilha</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Sequência sugerida para aprender redes</h1>
      </section>

      <div className="card-surface rounded-[28px] p-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 font-bold text-slate-950">
                {index + 1}
              </div>
              <div className="text-lg font-medium text-white">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
