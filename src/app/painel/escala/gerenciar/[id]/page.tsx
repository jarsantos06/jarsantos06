import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { roleLabel } from "@/lib/rbac";
import { db } from "@/lib/db";
import { montarMes } from "@/lib/escala";
import { formatCivil } from "@/lib/date";
import { PageHeader, Card, Badge, btn } from "@/components/ui";
import { CalendarioEscala } from "../../CalendarioEscala";
import { EscalaAcoes } from "../../EscalaAcoes";
import { carregarAtribuicoes, resolverMes } from "../../data";

export default async function FuncionarioEscalaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  await requirePermission("escala.gerenciar");
  const { id } = await params;
  const { ano, mes } = resolverMes(await searchParams);

  const funcionario = await db.user.findUnique({ where: { id } });
  if (!funcionario) notFound();

  const [atribuicoes, registros] = await Promise.all([
    carregarAtribuicoes(id),
    db.escalaFuncionario.findMany({
      where: { funcionarioId: id },
      include: {
        padrao: true,
        turno: true,
        criadoPor: { select: { nome: true } },
      },
      orderBy: { dataInicio: "desc" },
    }),
  ]);

  const dias = montarMes(atribuicoes, ano, mes);
  const hoje = new Date();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        voltarHref="/painel/escala/gerenciar"
        voltarLabel="Equipe"
        titulo={funcionario.nome}
        subtitulo={`${roleLabel(funcionario.role)} · ${funcionario.matricula}`}
        acoes={
          <Link
            href={`/painel/escala/nova?funcionarioId=${id}`}
            className={btn("primary", "sm")}
          >
            + Nova escala
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CalendarioEscala
          dias={dias}
          ano={ano}
          mes={mes}
          basePath={`/painel/escala/gerenciar/${id}`}
        />

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-800">
            Atribuições de escala
          </h2>
          <ul className="space-y-4">
            {registros.map((r) => {
              const encerrada = !!r.dataFim && r.dataFim < hoje;
              const vigente =
                r.dataInicio <= hoje && (!r.dataFim || r.dataFim >= hoje);
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      {r.padrao.nome} · {r.turno.nome}
                      <span className="ml-1 text-xs text-slate-400">
                        ({r.turno.horaInicio}–{r.turno.horaFim})
                      </span>
                    </span>
                    {vigente && <Badge tone="green">vigente</Badge>}
                    {encerrada && <Badge tone="slate">encerrada</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Início: {formatCivil(r.dataInicio)}
                    {r.dataFim
                      ? ` · Fim: ${formatCivil(r.dataFim)}`
                      : " · padronizada (sem fim)"}
                    {" · por "}
                    {r.criadoPor.nome}
                  </p>
                  {r.observacao && (
                    <p className="mt-1 text-xs text-slate-400">
                      {r.observacao}
                    </p>
                  )}
                  <div className="mt-3">
                    <EscalaAcoes id={r.id} encerrada={encerrada} />
                  </div>
                </li>
              );
            })}
            {registros.length === 0 && (
              <li className="text-sm text-slate-400">
                Nenhuma escala atribuída a este funcionário.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
