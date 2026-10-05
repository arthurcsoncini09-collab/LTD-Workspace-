export default function PerfilPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Perfil</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Estudante NetLearn</h1>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="card-surface rounded-[28px] p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-black text-slate-950">E</div>
          <div className="mt-5 text-2xl font-bold text-white">Estudante</div>
          <div className="mt-2 text-sm text-slate-300">Nível: Rookie em Redes</div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['XP', '3.420'],
              ['Streak', '14 dias'],
              ['Taxa de acertos', '82%'],
              ['Cursos concluídos', '9'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-sm text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
