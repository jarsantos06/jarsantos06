"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { salvarUpload } from "@/lib/upload";
import { parseCivilDate } from "@/lib/date";

export type ActionState = { erro?: string; ok?: string };

// ---------------------------------------------------------------------------
// Criar ocorrência (todos os funcionários)
// ---------------------------------------------------------------------------
const ocorrenciaSchema = z.object({
  tipo: z.enum(["FALTA", "ATRASO"]),
  dataOcorrencia: z.string().min(1, "Informe a data da ocorrência."),
  motivo: z
    .string()
    .trim()
    .min(5, "Descreva o motivo (mín. 5 caracteres).")
    .max(600),
});

export async function criarOcorrenciaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("ocorrencia.criar");

  const parsed = ocorrenciaSchema.safeParse({
    tipo: formData.get("tipo"),
    dataOcorrencia: formData.get("dataOcorrencia"),
    motivo: formData.get("motivo"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parseCivilDate(parsed.data.dataOcorrencia);
  if (!data) {
    return { erro: "Data da ocorrência inválida." };
  }

  // Evidência é opcional
  let evidenciaUrl: string | null = null;
  const anexo = formData.get("evidencia");
  if (anexo instanceof File && anexo.size > 0) {
    const up = await salvarUpload(anexo, "ocorrencias");
    if (up.erro || !up.url) return { erro: up.erro ?? "Falha no anexo." };
    evidenciaUrl = up.url;
  }

  await db.ocorrencia.create({
    data: {
      tipo: parsed.data.tipo,
      dataOcorrencia: data,
      motivo: parsed.data.motivo,
      evidenciaUrl,
      solicitanteId: sessao.userId,
      status: "PENDENTE",
    },
  });

  revalidatePath("/painel/ocorrencias");
  return { ok: "Ocorrência enviada para aprovação do gestor." };
}

// ---------------------------------------------------------------------------
// Decidir ocorrência — aprovar/reprovar (Supervisor e Gerente)
// ---------------------------------------------------------------------------
const decisaoSchema = z.object({
  id: z.string().min(1),
  decisao: z.enum(["APROVADA", "REPROVADA"]),
  parecer: z.string().trim().max(400).optional(),
});

export async function decidirOcorrenciaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("ocorrencia.aprovar");

  const parsed = decisaoSchema.safeParse({
    id: formData.get("id"),
    decisao: formData.get("decisao"),
    parecer: formData.get("parecer") || undefined,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const ocorrencia = await db.ocorrencia.findUnique({
    where: { id: parsed.data.id },
  });
  if (!ocorrencia) return { erro: "Ocorrência não encontrada." };
  if (ocorrencia.status !== "PENDENTE") {
    return { erro: "Esta ocorrência já foi decidida." };
  }
  // O gestor não pode aprovar a própria ocorrência
  if (ocorrencia.solicitanteId === sessao.userId) {
    return { erro: "Você não pode decidir sua própria ocorrência." };
  }

  await db.ocorrencia.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.decisao,
      parecer: parsed.data.parecer ?? null,
      aprovadorId: sessao.userId,
      decididoEm: new Date(),
    },
  });

  revalidatePath("/painel/ocorrencias");
  revalidatePath("/painel/ocorrencias/aprovacoes");
  return {
    ok:
      parsed.data.decisao === "APROVADA"
        ? "Ocorrência aprovada."
        : "Ocorrência reprovada.",
  };
}
