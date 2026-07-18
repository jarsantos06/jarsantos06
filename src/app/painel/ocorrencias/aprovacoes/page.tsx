import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCivil } from "@/lib/date";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { DecisaoForm } from "../DecisaoForm";
import { StatusBadge, tipoLabel } from "../ui";

export default async function AprovacoesPage() {
  const sessao = await requirePermission("ocorrencia.aprovar");

  const [pendentes, decididas] = await Promise.all([
    db.ocorrencia.findMany({
      where: { status: "PENDENTE", NOT: { solicitanteId: sessao.userId } },
      orderBy: { createdAt: "asc" },
      include: { solicitante: { select: { nome: true, matricula: true } } },
    }),
    db.ocorrencia.findMany({
      where: { status: { in: ["APROVADA", "REPROVADA"] } },
      orderBy: { decididoEm: "desc" },
      take: 20,
      include: {
        solicitante: { select: { nome: true } },
        aprovador: { select: { nome: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        voltarHref="/painel/ocorrencias"
        voltarLabel="Ocorrências"
        titulo="Aprovações de ocorrências"
        subtitulo={`${pendentes.length} pendente(s) aguardando sua decisão`}
      />

      {/* Pendentes */}
      <div className="space-y-4">
        {pendentes.map((o) => (
          <Card key={o.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    {o.solicitante.nome}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {o.solicitante.matricula}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  <strong>{tipoLabel(o.tipo)}</strong> em{" "}
                  {formatCivil(o.dataOcorrencia)}
                  <span className="ml-2 text-xs text-slate-400">
                    registrada em {o.createdAt.toLocaleDateString("pt-BR")}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-500">{o.motivo}</p>
                {o.evidenciaUrl && (
                  <a
                    href={o.evidenciaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 hover:underline"
                  >
                    📎 ver evidência
                  </a>
                )}
              </div>
              <div className="w-full sm:w-64">
                <DecisaoForm id={o.id} />
              </div>
            </div>
          </Card>
        ))}
        {pendentes.length === 0 && (
          <EmptyState
            emoji="🎉"
            titulo="Nenhuma ocorrência pendente"
            descricao="Quando um funcionário registrar uma falta ou atraso, ela aparece aqui."
          />
        )}
      </div>

      {/* Histórico de decisões */}
      <h2 className="mb-3 mt-8 font-semibold text-slate-700">
        Decididas recentemente
      </h2>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Funcionário</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Decidido por</th>
              <th className="px-4 py-3 font-medium">Quando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {decididas.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">
                  {o.solicitante.nome}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {tipoLabel(o.tipo)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {o.aprovador?.nome ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {o.decididoEm?.toLocaleString("pt-BR") ?? "—"}
                </td>
              </tr>
            ))}
            {decididas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhuma decisão registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
