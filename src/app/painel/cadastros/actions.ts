"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { ehPermissaoValida, type Permission } from "@/lib/rbac";

export type ActionState = { erro?: string; ok?: string };

function ehConflitoUnico(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

// ---------------------------------------------------------------------------
// FUNCIONÁRIOS
// ---------------------------------------------------------------------------
const funcionarioBase = {
  nome: z.string().trim().min(2, "Informe o nome.").max(120),
  email: z
    .union([z.string().trim().email("E-mail inválido."), z.literal("")])
    .optional(),
  cargoId: z.string().min(1, "Selecione o cargo."),
};

const criarFuncionarioSchema = z.object({
  ...funcionarioBase,
  matricula: z
    .string()
    .trim()
    .min(2, "Informe a matrícula.")
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, "Matrícula: use letras, números ou hífen."),
  senha: z.string().min(6, "Senha inicial: mínimo 6 caracteres.").max(72),
});

export async function criarFuncionarioAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("cadastros.gerenciar");

  const parsed = criarFuncionarioSchema.safeParse({
    matricula: formData.get("matricula"),
    nome: formData.get("nome"),
    email: formData.get("email") ?? "",
    cargoId: formData.get("cargoId"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const cargo = await db.cargo.findUnique({
    where: { id: parsed.data.cargoId },
  });
  if (!cargo || !cargo.ativo) return { erro: "Cargo inválido ou inativo." };

  try {
    await db.user.create({
      data: {
        matricula: parsed.data.matricula,
        nome: parsed.data.nome,
        email: parsed.data.email || null,
        cargoId: cargo.id,
        senhaHash: await hashPassword(parsed.data.senha),
      },
    });
  } catch (e) {
    if (ehConflitoUnico(e)) {
      return { erro: "Já existe funcionário com essa matrícula ou e-mail." };
    }
    throw e;
  }

  revalidatePath("/painel/cadastros/funcionarios");
  return { ok: `Funcionário ${parsed.data.nome} cadastrado.` };
}

const editarFuncionarioSchema = z.object({
  id: z.string().min(1),
  ...funcionarioBase,
  ativo: z.enum(["on", "off"]),
  novaSenha: z
    .union([
      z.string().min(6, "Nova senha: mínimo 6 caracteres.").max(72),
      z.literal(""),
    ])
    .optional(),
});

export async function editarFuncionarioAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("cadastros.gerenciar");

  const parsed = editarFuncionarioSchema.safeParse({
    id: formData.get("id"),
    nome: formData.get("nome"),
    email: formData.get("email") ?? "",
    cargoId: formData.get("cargoId"),
    ativo: formData.get("ativo") ?? "off",
    novaSenha: formData.get("novaSenha") ?? "",
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { id, nome, email, cargoId, ativo, novaSenha } = parsed.data;

  const alvo = await db.user.findUnique({ where: { id } });
  if (!alvo) return { erro: "Funcionário não encontrado." };

  // Trava de segurança: ninguém desativa a própria conta
  if (id === sessao.userId && ativo !== "on") {
    return { erro: "Você não pode desativar a sua própria conta." };
  }

  const cargo = await db.cargo.findUnique({ where: { id: cargoId } });
  if (!cargo) return { erro: "Cargo inválido." };

  try {
    await db.user.update({
      where: { id },
      data: {
        nome,
        email: email || null,
        cargoId,
        ativo: ativo === "on",
        ...(novaSenha ? { senhaHash: await hashPassword(novaSenha) } : {}),
      },
    });
  } catch (e) {
    if (ehConflitoUnico(e)) {
      return { erro: "Já existe funcionário com esse e-mail." };
    }
    throw e;
  }

  revalidatePath("/painel/cadastros/funcionarios");
  redirect("/painel/cadastros/funcionarios?ok=editado");
}

// ---------------------------------------------------------------------------
// CARGOS
// ---------------------------------------------------------------------------
function lerPermissoes(formData: FormData): Permission[] {
  return formData.getAll("permissoes").map(String).filter(ehPermissaoValida);
}

const cargoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cargo.").max(60),
  nivel: z.coerce.number().int().min(0).max(99).default(0),
});

export async function criarCargoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("cadastros.gerenciar");

  const parsed = cargoSchema.safeParse({
    nome: formData.get("nome"),
    nivel: formData.get("nivel") || 0,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const permissoes = lerPermissoes(formData);

  try {
    await db.cargo.create({
      data: {
        nome: parsed.data.nome,
        nivel: parsed.data.nivel,
        permissoes: {
          create: permissoes.map((p) => ({ permissao: p })),
        },
      },
    });
  } catch (e) {
    if (ehConflitoUnico(e)) {
      return { erro: "Já existe um cargo com esse nome." };
    }
    throw e;
  }

  revalidatePath("/painel/cadastros/cargos");
  redirect("/painel/cadastros/cargos?ok=criado");
}

const editarCargoSchema = cargoSchema.extend({
  id: z.string().min(1),
  ativo: z.enum(["on", "off"]),
});

export async function editarCargoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessao = await requirePermission("cadastros.gerenciar");

  const parsed = editarCargoSchema.safeParse({
    id: formData.get("id"),
    nome: formData.get("nome"),
    nivel: formData.get("nivel") || 0,
    ativo: formData.get("ativo") ?? "off",
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { id, nome, nivel, ativo } = parsed.data;
  const permissoes = lerPermissoes(formData);

  const cargo = await db.cargo.findUnique({ where: { id } });
  if (!cargo) return { erro: "Cargo não encontrado." };

  // Travas anti-bloqueio: quem gerencia cadastros não pode se trancar fora.
  if (id === sessao.cargoId) {
    if (ativo !== "on") {
      return { erro: "Você não pode desativar o seu próprio cargo." };
    }
    if (!permissoes.includes("cadastros.gerenciar")) {
      return {
        erro: "Você não pode remover a permissão de gerenciar cadastros do seu próprio cargo.",
      };
    }
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.cargo.update({
        where: { id },
        data: { nome, nivel, ativo: ativo === "on" },
      });
      // Repõe o conjunto de permissões conforme os checkboxes marcados
      await tx.cargoPermissao.deleteMany({ where: { cargoId: id } });
      if (permissoes.length > 0) {
        await tx.cargoPermissao.createMany({
          data: permissoes.map((p) => ({ cargoId: id, permissao: p })),
        });
      }
    });
  } catch (e) {
    if (ehConflitoUnico(e)) {
      return { erro: "Já existe um cargo com esse nome." };
    }
    throw e;
  }

  revalidatePath("/painel/cadastros/cargos");
  revalidatePath(`/painel/cadastros/cargos/${id}`);
  return { ok: "Cargo atualizado. As permissões já estão valendo." };
}
