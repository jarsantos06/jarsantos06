import Link from "next/link";

export function EmConstrucao({
  titulo,
  emoji,
}: {
  titulo: string;
  emoji: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/painel"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Voltar ao painel
      </Link>
      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mb-3 text-5xl">{emoji}</div>
        <h1 className="text-xl font-semibold text-slate-800">{titulo}</h1>
        <p className="mt-2 text-slate-500">
          Módulo em construção — será entregue na próxima fase. 🚧
        </p>
      </div>
    </div>
  );
}
