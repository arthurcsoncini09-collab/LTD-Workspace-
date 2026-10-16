import { getModuleSummaries } from '@/lib/netlearn-db';
import { ProgressView } from '@/components/progress-views';

export default function ProgressoPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Progresso</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Acompanhamento do seu aprendizado</h1>
      </section>

      <ProgressView modules={getModuleSummaries()} />
    </div>
  );
}
