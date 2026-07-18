import Link from "next/link";
import { requirePermission } from "@/lib/auth";

import { db } from "@/lib/db";
import { atribuicaoDoDia, type AtribuicaoEscala } from "@/lib/escala";
import { PageHeader, Card, btn } from "@/components/ui";

export default async function GerenciarEscalaPage() {
  await requirePermission("escala.gerenciar");

  const [usuarios, escalas] = await Promise.all([
    db.user.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      include: { cargo: { select: { nome: true } } },
    }),
    db.escalaFuncionario.findMany({
      include: { padrao: true, turno: true },
      orderBy: { dataInicio: "asc" },
    }),
  ]);

  const hoje = new Date();

  // Agrupa atribuições por funcionário
  const porFuncionario = new Map<string, AtribuicaoEscala[]>();
  for (const e of escalas) {
    const arr = porFuncionario.get(e.funcionarioId) ?? [];
    arr.push({
      dataInicio: e.dataInicio,
      dataFim: e.dataFim,
      diasTrabalho: e.padrao.diasTrabalho,
      diasFolga: e.padrao.diasFolga,
      turnoNome: e.turno.nome,
      turnoInicio: e.turno.horaInicio,
      turnoFim: e.turno.horaFim,
    });
    porFuncionario.set(e.funcionarioId, arr);
  }
  // Nome do padrão vigente por funcionário
  const padraoAtualNome = new Map<string, string>();
  for (const e of escalas) {
    const atual = atribuicaoDoDia(
      porFuncionario.get(e.funcionarioId) ?? [],
      hoje,
    );
    if (
      atual &&
      atual.dataInicio.getTime() === e.dataInicio.getTime() &&
      atual.turnoNome === e.turno.nome
    ) {
      padraoAtualNome.set(e.funcionarioId, e.padrao.nome);
    }
  }

  const semEscala = usuarios.filter(
    (u) => !atribuicaoDoDia(porFuncionario.get(u.id) ?? [], hoje),
  ).length;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        voltarHref="/painel/escala"
        voltarLabel="Minha escala"
        titulo="Gerenciar escalas da equipe"
        subtitulo={
          semEscala > 0
            ? `${semEscala} funcionário(s) sem escala vigente`
            : "Toda a equipe tem escala vigente"
        }
        acoes={
          <>
            <Link
              href="/painel/escala/config"
              className={btn("secondary", "sm")}
            >
              ⚙️ Turnos e padrões
            </Link>
            <Link href="/painel/escala/nova" className={btn("primary", "sm")}>
              + Nova escala
            </Link>
          </>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Funcionário</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Escala atual</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u) => {
              const atual = atribuicaoDoDia(
                porFuncionario.get(u.id) ?? [],
                hoje,
              );
              const nomePadrao = padraoAtualNome.get(u.id);
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{u.nome}</div>
                    <div className="font-mono text-xs text-slate-400">
                      {u.matricula}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.cargo?.nome ?? "Sem cargo"}
                  </td>
                  <td className="px-4 py-3">
                    {atual ? (
                      <span className="text-slate-700">
                        <strong>{nomePadrao ?? "—"}</strong> · {atual.turnoNome}{" "}
                        <span className="text-slate-400">
                          ({atual.turnoInicio}–{atual.turnoFim})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Sem escala</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/painel/escala/gerenciar/${u.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Ver / editar →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
