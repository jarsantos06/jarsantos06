import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { duracaoCurta, tempoDecorrido } from "@/lib/date";
import { PageHeader, Card, Badge } from "@/components/ui";

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

  const agora = new Date();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        voltarHref="/painel/carreta"
        voltarLabel="Travamento de Carreta"
        titulo="🕑 Histórico de carretas"
        subtitulo={`${registros.length} registro(s)`}
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Placa</th>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Travada em / por</th>
              <th className="px-4 py-3 font-medium">Destravada em / por</th>
              <th className="px-4 py-3 font-medium">Permanência</th>
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
                  <Badge tone={t.status === "TRAVADA" ? "red" : "green"}>
                    {t.status}
                  </Badge>
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
                <td className="px-4 py-3 text-xs text-slate-600">
                  {t.destravadoEm
                    ? duracaoCurta(t.travadoEm, t.destravadoEm)
                    : tempoDecorrido(t.travadoEm, agora)}
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
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhum registro de travamento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
