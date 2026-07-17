import "server-only";
import { db } from "@/lib/db";
import type { AtribuicaoEscala } from "@/lib/escala";

/** Carrega as atribuições de um funcionário no formato usado pelo cálculo. */
export async function carregarAtribuicoes(
  funcionarioId: string,
): Promise<AtribuicaoEscala[]> {
  const registros = await db.escalaFuncionario.findMany({
    where: { funcionarioId },
    include: { padrao: true, turno: true },
    orderBy: { dataInicio: "asc" },
  });

  return registros.map((r) => ({
    dataInicio: r.dataInicio,
    dataFim: r.dataFim,
    diasTrabalho: r.padrao.diasTrabalho,
    diasFolga: r.padrao.diasFolga,
    turnoNome: r.turno.nome,
    turnoInicio: r.turno.horaInicio,
    turnoFim: r.turno.horaFim,
  }));
}

/** Interpreta ?ano=&mes= com fallback para o mês atual. */
export function resolverMes(sp: { ano?: string; mes?: string }): {
  ano: number;
  mes: number;
} {
  const agora = new Date();
  let ano = Number(sp.ano);
  let mes = Number(sp.mes);
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    ano = agora.getFullYear();
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    mes = agora.getMonth() + 1;
  }
  return { ano, mes };
}
