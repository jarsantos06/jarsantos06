"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { salvarUpload } from "@/lib/upload";

export type ActionState = { erro?: string; ok?: string };

function ehColisaoUnica(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

const travarSchema = z.object({
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, "Placa inválida.")
    .max(8, "Placa inválida."),
  // Ticket é preenchido manualmente pelo operador (obrigatório e único).
  ticket: z
    .string()
    .trim()
    .min(1, "Informe o ticket.")
    .max(40, "Ticket muito longo."),
});

// ---------------------------------------------------------------------------
// Travar carreta (Controlador e Encarregado)
// Ticket é manual; a data/hora é registrada automaticamente (travadoEm).
// ---------------------------------------------------------------------------
export async function travarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("carreta.operar");

  const parsed = travarSchema.safeParse({
    placa: formData.get("placa"),
    ticket: formData.get("ticket"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { placa, ticket } = parsed.data;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) {
    return { erro: "A foto da carreta é obrigatória." };
  }
  const up = await salvarUpload(foto, "carretas");
  if (up.erro || !up.url) return { erro: up.erro ?? "Falha no upload." };

  try {
    await db.travamento.create({
      data: {
        placa,
        ticket,
        fotoUrl: up.url,
        observacao,
        operadorId: sessao.userId,
        status: "TRAVADA",
      },
    });
  } catch (e) {
    if (ehColisaoUnica(e)) {
      return { erro: `Já existe um registro com o ticket "${ticket}".` };
    }
    throw e;
  }

  revalidatePath("/painel/carreta");
  return { ok: `Carreta ${placa} travada. Ticket ${ticket}.` };
}

// ---------------------------------------------------------------------------
// Destravar carreta (Controlador e Encarregado)
// ---------------------------------------------------------------------------
export async function destravarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("carreta.operar");
  const id = String(formData.get("id") ?? "");

  const trava = await db.travamento.findUnique({ where: { id } });
  if (!trava) return { erro: "Registro não encontrado." };
  if (trava.status === "DESTRAVADA") {
    return { erro: "Esta carreta já está destravada." };
  }

  await db.travamento.update({
    where: { id },
    data: {
      status: "DESTRAVADA",
      destravadorId: sessao.userId,
      destravadoEm: new Date(),
    },
  });

  revalidatePath("/painel/carreta");
  return { ok: `Carreta ${trava.placa} destravada.` };
}
