import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatCivil } from "@/lib/date";
import type { StatusOcorrencia } from "@prisma/client";
import { PageHeader, Card, EmptyState, btn } from "@/components/ui";
import { NovaOcorrenciaForm } from "./NovaOcorrenciaForm";
import { StatusBadge, tipoLabel } from "./ui";

const FILTROS: { chave?: StatusOcorrencia; label: string }[] = [
  { label: "Todas" },
  { chave: "PENDENTE", label: "Pendentes" },
  { chave: "APROVADA", label: "Aprovadas" },
  { chave: "REPROVADA", label: "Reprovadas" },
];

export default async function OcorrenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sessao = await requirePermission("ocorrencia.criar");
  const podeAprovar = can(sessao.permissoes, "ocorrencia.aprovar");
  const { status } = await searchParams;
  const filtro = FILTROS.find((f) => f.chave === status)?.chave;

  const [minhas, contagens, pendentesCount] = await Promise.all([
    db.ocorrencia.findMany({
      where: {
        solicitanteId: sessao.userId,
        ...(filtro ? { status: filtro } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.ocorrencia.groupBy({
      by: ["status"],
      where: { solicitanteId: sessao.userId },
      _count: true,
    }),
    podeAprovar
      ? db.ocorrencia.count({
          where: { status: "PENDENTE", NOT: { solicitanteId: sessao.userId } },
        })
      : Promise.resolve(0),
  ]);

  const contar = (s: StatusOcorrencia) =>
    contagens.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        voltarHref="/painel"
        voltarLabel="Painel"
        titulo="📝 Ocorrências"
        subtitulo="Registro de faltas e atrasos"
        acoes={
          podeAprovar ? (
            <Link
              href="/painel/ocorrencias/aprovacoes"
              className={btn("primary", "sm")}
            >
              Aprovações pendentes
              {pendentesCount > 0 && (
                <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand-700">
                  {pendentesCount}
                </span>
              )}
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nova ocorrência */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Nova ocorrência</h2>
          <NovaOcorrenciaForm nomeUsuario={sessao.nome} />
        </Card>

        {/* Minhas ocorrências */}
        <div>
          <div className="mb-3 flex flex-wrap gap-1">
            {FILTROS.map((f) => (
              <Link
                key={f.label}
                href={
                  f.chave
                    ? `/painel/ocorrencias?status=${f.chave}`
                    : "/painel/ocorrencias"
                }
                className={btn(filtro === f.chave ? "primary" : "ghost", "sm")}
              >
                {f.label}
                {f.chave && (
                  <span className="ml-1 text-xs opacity-70">
                    {contar(f.chave)}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {minhas.length === 0 ? (
            <EmptyState
              emoji="🗂️"
              titulo="Nenhuma ocorrência aqui"
              descricao={
                filtro
                  ? "Nada com esse status."
                  : "Você ainda não registrou ocorrências."
              }
            />
          ) : (
            <Card className="p-5">
              <ul className="space-y-3">
                {minhas.map((o) => (
                  <li
                    key={o.id}
                    className="border-b border-slate-100 pb-3 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">
                        {tipoLabel(o.tipo)} · {formatCivil(o.dataOcorrencia)}
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
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
