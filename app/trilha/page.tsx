import { getModuleSummaries } from '@/lib/netlearn-db';
import { TrailList } from '@/components/trail-list';

export default function TrilhaPage() {
  const modules = getModuleSummaries();

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Trilha</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Sequência sugerida para aprender redes</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          {modules.length} módulos, do básico ao projeto final. Cada módulo tem aulas, comandos, laboratório e quiz. Os módulos concluídos ficam marcados em verde.
        </p>
      </section>

      <div className="card-surface rounded-[28px] p-4 sm:p-6">
        <TrailList modules={modules} />
      </div>
    </div>
  );
}
