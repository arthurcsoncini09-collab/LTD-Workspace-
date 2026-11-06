import { getModuleSummaries } from '@/lib/netlearn-db';
import { ProfileView } from '@/components/progress-views';

export default function PerfilPage() {
  return (
    <div className="space-y-8">
      <section className="card-surface rounded-xl p-6 sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Perfil</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Estudante NetLearn</h1>
      </section>

      <ProfileView modules={getModuleSummaries()} />
    </div>
  );
}
