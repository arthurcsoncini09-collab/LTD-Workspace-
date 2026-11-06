import { getGlossaryTerms } from '@/lib/netlearn-db';
import { GlossarySearch } from '@/components/glossary-search';

export default function GlossarioPage({ searchParams }: { searchParams: { q?: string } }) {
  const terms = getGlossaryTerms();
  const initialQuery = typeof searchParams.q === 'string' ? searchParams.q : '';

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-xl p-6 sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Glossário</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Termos essenciais de redes</h1>
      </section>

      {/* key: ao chegar por um link de busca com outro termo, o campo é reiniciado com o novo valor */}
      <GlossarySearch key={initialQuery} terms={terms} initialQuery={initialQuery} />
    </div>
  );
}
