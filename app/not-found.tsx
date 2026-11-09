import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="card-surface mx-auto max-w-2xl rounded-xl p-8 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Erro 404</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Destino inalcançável</h1>
      <p className="mt-3 text-slate-300">
        Como um pacote sem rota na tabela, esta página não encontrou caminho. Verifique o endereço ou volte para a trilha.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/aprender" className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-3 font-semibold text-white">
          Ver módulos
        </Link>
        <Link href="/" className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-100">
          Página inicial
        </Link>
      </div>
    </section>
  );
}
