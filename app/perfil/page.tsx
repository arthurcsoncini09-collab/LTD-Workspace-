import { getModuleSummaries } from '@/lib/netlearn-db';
import { ProfileView } from '@/components/progress-views';

export default function PerfilPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Perfil</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Estudante NetLearn</h1>
      </section>

      <ProfileView modules={getModuleSummaries()} />
    </div>
  );
}
