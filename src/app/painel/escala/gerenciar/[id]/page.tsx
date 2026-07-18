import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { roleLabel } from "@/lib/rbac";
import { db } from "@/lib/db";
import { montarMes } from "@/lib/escala";
import { formatCivil } from "@/lib/date";
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
      <Link
        href="/painel/escala/gerenciar"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Equipe
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {funcionario.nome}
          </h1>
          <p className="text-sm text-slate-500">
            {roleLabel(funcionario.role)} · {funcionario.matricula}
          </p>
        </div>
        <Link
          href={`/painel/escala/nova?funcionarioId=${id}`}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nova escala
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CalendarioEscala
          dias={dias}
          ano={ano}
          mes={mes}
          basePath={`/painel/escala/gerenciar/${id}`}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
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
                    {vigente && (
                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        vigente
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Início: {formatCivil(r.dataInicio)}
                    {r.dataFim
                      ? ` · Fim: ${formatCivil(r.dataFim)}`
                      : " · padronizada (sem fim)"}
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
        </div>
      </div>
    </div>
  );
}
