import { getGlossaryTerms } from '@/lib/netlearn-db';
import { GlossarySearch } from '@/components/glossary-search';

export default function GlossarioPage() {
  const terms = getGlossaryTerms();

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Glossário</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Termos essenciais de redes</h1>
      </section>

      <GlossarySearch terms={terms} />
    </div>
  );
}
