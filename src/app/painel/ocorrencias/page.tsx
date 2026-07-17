import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { NovaOcorrenciaForm } from "./NovaOcorrenciaForm";
import { StatusBadge, tipoLabel } from "./ui";

export default async function OcorrenciasPage() {
  const sessao = await requirePermission("ocorrencia.criar");
  const podeAprovar = can(sessao.role, "ocorrencia.aprovar");

  const [minhas, pendentesCount] = await Promise.all([
    db.ocorrencia.findMany({
      where: { solicitanteId: sessao.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    podeAprovar
      ? db.ocorrencia.count({
          where: { status: "PENDENTE", NOT: { solicitanteId: sessao.userId } },
        })
      : Promise.resolve(0),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/painel" className="text-sm text-brand-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">📝 Ocorrências</h1>
          <p className="text-slate-500">Registro de faltas e atrasos</p>
        </div>
        {podeAprovar && (
          <Link
            href="/painel/ocorrencias/aprovacoes"
            className="relative rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Aprovações pendentes
            {pendentesCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand-700">
                {pendentesCount}
              </span>
            )}
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nova ocorrência */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Nova ocorrência</h2>
          <NovaOcorrenciaForm nomeUsuario={sessao.nome} />
        </div>

        {/* Minhas ocorrências */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Minhas ocorrências</h2>
          <ul className="space-y-3">
            {minhas.map((o) => (
              <li
                key={o.id}
                className="border-b border-slate-100 pb-3 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {tipoLabel(o.tipo)} ·{" "}
                    {o.dataOcorrencia.toLocaleDateString("pt-BR")}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{o.motivo}</p>
                {o.status !== "PENDENTE" && o.parecer && (
                  <p className="mt-1 text-xs text-slate-400">
                    Parecer do gestor: {o.parecer}
                  </p>
                )}
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
              </li>
            ))}
            {minhas.length === 0 && (
              <li className="text-sm text-slate-400">
                Você ainda não registrou ocorrências.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
