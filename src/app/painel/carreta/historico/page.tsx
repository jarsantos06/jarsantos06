import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function HistoricoCarretaPage() {
  await requirePermission("carreta.ver");

  const registros = await db.travamento.findMany({
    orderBy: { travadoEm: "desc" },
    take: 100,
    include: {
      operador: { select: { nome: true } },
      destravador: { select: { nome: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/painel/carreta" className="text-sm text-brand-600 hover:underline">
        ← Travamento de Carreta
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-slate-800">
        🕑 Histórico de carretas
      </h1>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Placa</th>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Travada em / por</th>
              <th className="px-4 py-3 font-medium">Destravada em / por</th>
              <th className="px-4 py-3 font-medium">Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registros.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                  {t.placa}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {t.ticket}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      t.status === "TRAVADA"
                        ? "rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                        : "rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                    }
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {t.travadoEm.toLocaleString("pt-BR")}
                  <br />
                  {t.operador.nome}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {t.destravadoEm ? (
                    <>
                      {t.destravadoEm.toLocaleString("pt-BR")}
                      <br />
                      {t.destravador?.nome ?? "—"}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={t.fotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    ver foto
                  </a>
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Nenhum registro de travamento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
