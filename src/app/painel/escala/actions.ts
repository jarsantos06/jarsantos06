"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { parseCivilDate } from "@/lib/date";

export type ActionState = { erro?: string; ok?: string };

// ---------------------------------------------------------------------------
// Criar/atribuir escala a um funcionário (Supervisor e Gerente)
// ---------------------------------------------------------------------------
const escalaSchema = z.object({
  funcionarioId: z.string().min(1, "Selecione o funcionário."),
  padraoId: z.string().min(1, "Selecione o padrão."),
  turnoId: z.string().min(1, "Selecione o turno."),
  dataInicio: z.string().min(1, "Informe a data de início."),
  dataFim: z.string().optional(),
  observacao: z.string().trim().max(200).optional(),
});

export async function criarEscalaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("escala.gerenciar");

  const parsed = escalaSchema.safeParse({
    funcionarioId: formData.get("funcionarioId"),
    padraoId: formData.get("padraoId"),
    turnoId: formData.get("turnoId"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim") || undefined,
    observacao: formData.get("observacao") || undefined,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const dataInicio = parseCivilDate(parsed.data.dataInicio);
  if (!dataInicio) return { erro: "Data de início inválida." };
  let dataFim: Date | null = null;
  if (parsed.data.dataFim) {
    dataFim = parseCivilDate(parsed.data.dataFim);
    if (!dataFim) return { erro: "Data fim inválida." };
    if (dataFim < dataInicio) {
      return { erro: "A data fim não pode ser antes do início." };
    }
  }

  // Valida existência/atividade dos IDs antes de criar (evita erro de FK cru)
  const [funcionario, padrao, turno] = await Promise.all([
    db.user.findUnique({ where: { id: parsed.data.funcionarioId } }),
    db.padraoEscala.findUnique({ where: { id: parsed.data.padraoId } }),
    db.turno.findUnique({ where: { id: parsed.data.turnoId } }),
  ]);
  if (!funcionario || !funcionario.ativo) {
    return { erro: "Funcionário inválido." };
  }
  if (!padrao || !padrao.ativo) return { erro: "Padrão inválido." };
  if (!turno || !turno.ativo) return { erro: "Turno inválido." };

  await db.escalaFuncionario.create({
    data: {
      funcionarioId: parsed.data.funcionarioId,
      padraoId: parsed.data.padraoId,
      turnoId: parsed.data.turnoId,
      dataInicio,
      dataFim,
      observacao: parsed.data.observacao ?? null,
      criadoPorId: sessao.userId,
    },
  });

  revalidatePath("/painel/escala/gerenciar");
  revalidatePath(`/painel/escala/gerenciar/${parsed.data.funcionarioId}`);
  revalidatePath("/painel/escala");
  return { ok: "Escala atribuída com sucesso." };
}

// Encerrar uma escala padronizada (define dataFim)
export async function encerrarEscalaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("escala.gerenciar");
  const id = String(formData.get("id") ?? "");
  const dataFim = parseCivilDate(String(formData.get("dataFim") ?? ""));
  if (!id || !dataFim) {
    return { erro: "Informe uma data de encerramento válida." };
  }
  const escala = await db.escalaFuncionario.findUnique({ where: { id } });
  if (!escala) return { erro: "Escala não encontrada." };
  if (dataFim < escala.dataInicio) {
    return { erro: "A data fim não pode ser antes do início." };
  }
  await db.escalaFuncionario.update({ where: { id }, data: { dataFim } });
  revalidatePath("/painel/escala/gerenciar");
  revalidatePath(`/painel/escala/gerenciar/${escala.funcionarioId}`);
  revalidatePath("/painel/escala");
  return { ok: "Escala encerrada." };
}

// Excluir uma atribuição de escala
export async function excluirEscalaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("escala.gerenciar");
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Registro inválido." };
  try {
    const escala = await db.escalaFuncionario.delete({ where: { id } });
    revalidatePath("/painel/escala/gerenciar");
    revalidatePath(`/painel/escala/gerenciar/${escala.funcionarioId}`);
    revalidatePath("/painel/escala");
    return { ok: "Escala removida." };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { erro: "Escala não encontrada." };
    }
    return { erro: "Não foi possível remover a escala." };
  }
}

// ---------------------------------------------------------------------------
// Configuração: novos turnos e padrões (Supervisor e Gerente)
// ---------------------------------------------------------------------------
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const turnoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do turno.").max(40),
  horaInicio: z.string().regex(HORA, "Hora início inválida (HH:MM)."),
  horaFim: z.string().regex(HORA, "Hora fim inválida (HH:MM)."),
});

export async function criarTurnoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("escala.gerenciar");
  const parsed = turnoSchema.safeParse({
    nome: formData.get("nome"),
    horaInicio: formData.get("horaInicio"),
    horaFim: formData.get("horaFim"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const existe = await db.turno.findUnique({
    where: { nome: parsed.data.nome },
  });
  if (existe) return { erro: "Já existe um turno com esse nome." };
  await db.turno.create({ data: parsed.data });
  revalidatePath("/painel/escala/config");
  return { ok: "Turno criado." };
}

const padraoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do padrão.").max(20),
  diasTrabalho: z.coerce.number().int().min(1).max(30),
  diasFolga: z.coerce.number().int().min(1).max(30),
});

export async function criarPadraoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("escala.gerenciar");
  const parsed = padraoSchema.safeParse({
    nome: formData.get("nome"),
    diasTrabalho: formData.get("diasTrabalho"),
    diasFolga: formData.get("diasFolga"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const existe = await db.padraoEscala.findUnique({
    where: { nome: parsed.data.nome },
  });
  if (existe) return { erro: "Já existe um padrão com esse nome." };
  await db.padraoEscala.create({ data: parsed.data });
  revalidatePath("/painel/escala/config");
  return { ok: "Padrão criado." };
}
