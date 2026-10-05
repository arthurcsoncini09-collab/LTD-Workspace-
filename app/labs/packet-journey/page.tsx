const journey = [
  'Aplicação cria a requisição',
  'DNS resolve o domínio',
  'TCP cria a conexão',
  'Segmentação',
  'IP define o destino',
  'ARP descobre o MAC do gateway',
  'Switch encaminha o quadro',
  'Router consulta a tabela de rotas',
  'NAT pode traduzir o endereço',
  'Pacote cruza a Internet',
  'Servidor recebe e responde',
  'Processo inverso acontece',
];

export default function PacketJourneyPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Packet Journey</div>
        <h1 className="mt-3 text-3xl font-bold text-white">A viagem do pacote pela rede</h1>
      </section>

      <div className="card-surface rounded-[28px] p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {journey.map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 font-bold text-slate-950">
                {index + 1}
              </div>
              <div className="text-slate-200">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
