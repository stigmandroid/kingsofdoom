import Link from "next/link";

export default function WarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-red-400">
          K.O.D. Command Center
        </p>

        <h1 className="mt-5 text-4xl font-black sm:text-5xl">Sala de Guerra</h1>

        <p className="mt-5 leading-7 text-slate-400">
          A War Room está em desenvolvimento. Em breve, esta área mostrará o
          mapa da guerra, ataques, estrelas, destruição e jogadores com ataques
          pendentes.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950 transition hover:bg-amber-300"
        >
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
