import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { roleLabel } from "@/lib/rbac";
import { db } from "@/lib/db";
import { atribuicaoDoDia, type AtribuicaoEscala } from "@/lib/escala";

export default async function GerenciarEscalaPage() {
  await requirePermission("escala.gerenciar");

  const [usuarios, escalas] = await Promise.all([
    db.user.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
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
  // Nome do padrão vigente (recupera do registro para exibir "2x2" etc.)
  const padraoAtualNome = new Map<string, string>();
  for (const e of escalas) {
    // guardamos o nome do padrão associado à atribuição vigente mais recente
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/painel/escala"
            className="text-sm text-brand-600 hover:underline"
          >
            ← Minha escala
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            Gerenciar escalas da equipe
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/painel/escala/config"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            ⚙️ Turnos e padrões
          </Link>
          <Link
            href="/painel/escala/nova"
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Nova escala
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
                    {roleLabel(u.role)}
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
      </div>
    </div>
  );
}
