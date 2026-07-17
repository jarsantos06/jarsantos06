import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
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
      <Link
        href="/painel/ocorrencias"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Ocorrências
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-slate-800">
        Aprovações de ocorrências
      </h1>

      {/* Pendentes */}
      <h2 className="mb-3 font-semibold text-slate-700">
        Pendentes ({pendentes.length})
      </h2>
      <div className="space-y-4">
        {pendentes.map((o) => (
          <div
            key={o.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
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
                  {o.dataOcorrencia.toLocaleDateString("pt-BR")}
                </p>
                <p className="mt-1 text-sm text-slate-500">{o.motivo}</p>
                {o.evidenciaUrl && (
                  <a
                    href={o.evidenciaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 hover:underline"
                  >
                    ver evidência
                  </a>
                )}
              </div>
              <div className="w-full sm:w-64">
                <DecisaoForm id={o.id} />
              </div>
            </div>
          </div>
        ))}
        {pendentes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
            Nenhuma ocorrência pendente. 🎉
          </div>
        )}
      </div>

      {/* Histórico de decisões */}
      <h2 className="mb-3 mt-8 font-semibold text-slate-700">Decididas recentemente</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
                <td className="px-4 py-3 text-slate-800">{o.solicitante.nome}</td>
                <td className="px-4 py-3 text-slate-600">{tipoLabel(o.tipo)}</td>
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
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma decisão registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
