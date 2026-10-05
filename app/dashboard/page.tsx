import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, Flame, Target, Zap } from 'lucide-react';

const stats = [
  { label: 'XP total', value: '3.420', accent: 'text-cyan-300' },
  { label: 'Sequência', value: '14 dias', accent: 'text-emerald-300' },
  { label: 'Taxa de acertos', value: '82%', accent: 'text-blue-300' },
  { label: 'Tempo de estudo', value: '5h 40m', accent: 'text-violet-300' },
];

const recommended = [
  'Subnetting — Parte 2',
  'TCP e UDP — Comparação prática',
  'DNS — Resolução passo a passo',
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Dashboard</div>
            <h1 className="mt-3 text-3xl font-bold text-white">Olá, estudante!</h1>
            <p className="mt-2 text-slate-300">Continue aprendendo. Seu próximo passo é dominar mais redes com prática.</p>
          </div>
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
            Próxima aula: <span className="font-semibold">Subnetting — Parte 2</span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="card-surface rounded-2xl p-5">
            <div className="text-sm text-slate-400">{label}</div>
            <div className={`mt-3 text-3xl font-bold ${accent}`}>{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Progresso</div>
              <h2 className="mt-2 text-2xl font-bold text-white">Curso: Fundamentos de Redes</h2>
            </div>
            <div className="text-2xl font-bold text-cyan-300">37%</div>
          </div>

          <div className="progress-bar mb-4">
            <span style={{ width: '37%' }} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: CheckCircle2, label: 'Aulas concluídas', value: '9/24' },
              { icon: Target, label: 'Exercícios', value: '32' },
              { icon: Zap, label: 'Conquistas', value: '06' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <Icon className="h-5 w-5 text-cyan-300" />
                <div className="mt-3 text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-4 flex items-center gap-2 text-cyan-300">
            <Flame className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.2em]">Streak</span>
          </div>
          <div className="text-4xl font-black text-white">14 dias</div>
          <p className="mt-3 text-slate-300">Mantenha a sequência para desbloquear a recompensa de Rede Devota.</p>
          <div className="mt-6 space-y-3">
            {['DNS', 'ARP', 'Subnetting'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                <span>{item}</span>
                <span className="text-emerald-300">✓</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
            <Clock3 className="h-4 w-4" />
            Recomendado
          </div>
          <div className="space-y-3">
            {recommended.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200">
                {item}
                <Link href="/aprender" className="text-cyan-300">Revisar</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Prática</div>
          <h3 className="mt-2 text-2xl font-bold text-white">Continuar com exercícios</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {['Subnetting', 'Port Explorer', 'OSI', 'TCP/IP'].map((topic) => (
              <div key={topic} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-lg font-semibold text-white">{topic}</div>
                <div className="mt-2 text-sm text-slate-400">Dificuldade: Iniciante</div>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                  Praticar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
