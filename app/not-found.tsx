import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="card-surface mx-auto max-w-2xl rounded-[28px] p-8 text-center">
      <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Erro 404</div>
      <h1 className="mt-3 text-3xl font-bold text-white">Destino inalcançável</h1>
      <p className="mt-3 text-slate-300">
        Como um pacote sem rota na tabela, esta página não encontrou caminho. Verifique o endereço ou volte para a trilha.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/aprender" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
          Ver módulos
        </Link>
        <Link href="/" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-100">
          Página inicial
        </Link>
      </div>
    </section>
  );
}
