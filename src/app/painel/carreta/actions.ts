"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { salvarUpload } from "@/lib/upload";

export type ActionState = { erro?: string; ok?: string };

// Gera um ticket sequencial legível: TRV-AAAAMMDD-NNNN
async function gerarTicket(): Promise<string> {
  const agora = new Date();
  const inicioDia = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
  );
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");

  const doDia = await db.travamento.count({
    where: { travadoEm: { gte: inicioDia } },
  });
  const seq = String(doDia + 1).padStart(4, "0");
  return `TRV-${y}${m}${d}-${seq}`;
}

function ehColisaoUnica(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

const placaSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(6, "Placa inválida.")
  .max(8, "Placa inválida.");

// ---------------------------------------------------------------------------
// Travar carreta (Controlador e Encarregado)
// ---------------------------------------------------------------------------
export async function travarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("carreta.operar");

  const placaParse = placaSchema.safeParse(formData.get("placa"));
  if (!placaParse.success) {
    return { erro: placaParse.error.issues[0]?.message ?? "Placa inválida." };
  }
  const placa = placaParse.data;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) {
    return { erro: "A foto da carreta é obrigatória." };
  }
  const up = await salvarUpload(foto, "carretas");
  if (up.erro || !up.url) return { erro: up.erro ?? "Falha no upload." };

  // ticket + data/hora são gerados automaticamente pelo sistema.
  // Sob concorrência, dois tickets podem colidir na sequência do dia; a
  // restrição @unique protege a integridade e aqui reprocessamos com o
  // MESMO formato (recalculando a sequência) até um número livre.
  let ticket = "";
  let criado = false;
  for (let tentativa = 0; tentativa < 6 && !criado; tentativa++) {
    ticket = await gerarTicket();
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
      criado = true;
    } catch (e) {
      if (ehColisaoUnica(e)) continue; // ticket ocupado: tenta o próximo
      throw e;
    }
  }
  if (!criado) {
    return { erro: "Não foi possível gerar o ticket. Tente novamente." };
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
