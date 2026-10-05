const quizzes = [
  { topic: 'OSI', type: 'Múltipla escolha', question: 'Qual camada define o roteamento?', answer: 'Camada 3 — Rede' },
  { topic: 'IPv4', type: 'Preencher', question: 'Qual o tamanho de um endereço IPv4?', answer: '32 bits' },
  { topic: 'ARP', type: 'Verdadeiro/Falso', question: 'ARP resolve IP em MAC.', answer: 'Verdadeiro' },
  { topic: 'DNS', type: 'Identificar protocolo', question: 'Qual protocolo converte domínio em IP?', answer: 'DNS' },
];

export default function QuizzesPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Quizzes</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Teste seu conhecimento em tempo real</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {quizzes.map(({ topic, type, question, answer }) => (
          <div key={question} className="card-surface rounded-[28px] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">{topic}</span>
              <span className="text-xs text-cyan-300">{type}</span>
            </div>
            <div className="text-lg font-medium text-white">{question}</div>
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">Resposta: {answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
