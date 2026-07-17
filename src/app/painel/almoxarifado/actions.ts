"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export type ActionState = { erro?: string; ok?: string };

// ---------------------------------------------------------------------------
// Cadastro de material (somente Supervisor)
// ---------------------------------------------------------------------------
const materialSchema = z.object({
  codigo: z.string().trim().min(1, "Informe o código.").max(30),
  nome: z.string().trim().min(2, "Informe o nome do material.").max(120),
  categoria: z.enum(["USO_DIARIO", "LIMPEZA"]),
  unidade: z.string().trim().min(1).max(10).default("UN"),
  estoqueMinimo: z.coerce.number().int().min(0).default(0),
});

export async function criarMaterialAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("almoxarifado.gerenciar");

  const parsed = materialSchema.safeParse({
    codigo: formData.get("codigo"),
    nome: formData.get("nome"),
    categoria: formData.get("categoria"),
    unidade: formData.get("unidade") || "UN",
    estoqueMinimo: formData.get("estoqueMinimo") || 0,
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existe = await db.material.findUnique({
    where: { codigo: parsed.data.codigo },
  });
  if (existe) return { erro: "Já existe um material com esse código." };

  await db.material.create({ data: { ...parsed.data, saldo: 0 } });
  revalidatePath("/painel/almoxarifado");
  return { ok: "Material cadastrado com sucesso." };
}

// ---------------------------------------------------------------------------
// Movimentação (entrada/saída) — Controlador, Encarregado, Supervisor
// Transação atômica: bloqueia saída maior que o saldo (estoque nunca negativo)
// ---------------------------------------------------------------------------
const movimentacaoSchema = z.object({
  materialId: z.string().min(1),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  quantidade: z.coerce.number().int().positive("Quantidade deve ser maior que zero."),
  destino: z.string().trim().max(120).optional(),
  observacao: z.string().trim().max(300).optional(),
});

export async function movimentarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("almoxarifado.movimentar");

  const parsed = movimentacaoSchema.safeParse({
    materialId: formData.get("materialId"),
    tipo: formData.get("tipo"),
    quantidade: formData.get("quantidade"),
    destino: formData.get("destino") || undefined,
    observacao: formData.get("observacao") || undefined,
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { materialId, tipo, quantidade, destino, observacao } = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      const material = await tx.material.findUnique({
        where: { id: materialId },
      });
      if (!material || !material.ativo) {
        throw new Error("Material não encontrado.");
      }

      const saldoApos =
        tipo === "ENTRADA"
          ? material.saldo + quantidade
          : material.saldo - quantidade;

      if (tipo === "SAIDA" && saldoApos < 0) {
        throw new Error(
          `Saldo insuficiente. Disponível: ${material.saldo} ${material.unidade}.`,
        );
      }

      await tx.material.update({
        where: { id: materialId },
        data: { saldo: saldoApos },
      });

      await tx.movimentacaoMaterial.create({
        data: {
          materialId,
          tipo,
          quantidade,
          saldoApos,
          destino,
          observacao,
          usuarioId: sessao.userId,
        },
      });
    });
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Falha ao movimentar." };
  }

  revalidatePath("/painel/almoxarifado");
  revalidatePath(`/painel/almoxarifado/${materialId}`);
  return {
    ok: `${tipo === "ENTRADA" ? "Entrada" : "Saída"} registrada com sucesso.`,
  };
}
