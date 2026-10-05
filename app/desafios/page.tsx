const desafios = [
  { title: 'Primeiro pacote', description: 'Complete um exercício de IPv4 e identifique a rede correta.', difficulty: 'Iniciante' },
  { title: 'Subnetting Rookie', description: 'Resolva um cenário com máscara /26 e determine rede e broadcast.', difficulty: 'Intermediário' },
  { title: 'TCP Expert', description: 'Analise quando usar TCP ou UDP em aplicações reais.', difficulty: 'Intermediário' },
  { title: 'Network Defender', description: 'Crie regras de firewall e avalie acesso permitido ou bloqueado.', difficulty: 'Avançado' },
];

export default function DesafiosPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Desafios</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Teste prático e conquistas</h1>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {desafios.map(({ title, description, difficulty }) => (
          <div key={title} className="card-surface rounded-[28px] p-5">
            <div className="mb-3 text-sm uppercase tracking-[0.2em] text-cyan-300">{difficulty}</div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
