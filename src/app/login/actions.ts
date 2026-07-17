"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export type LoginState = { erro?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const matricula = String(formData.get("matricula") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!matricula || !senha) {
    return { erro: "Informe matrícula e senha." };
  }

  const user = await db.user.findUnique({ where: { matricula } });
  if (!user || !user.ativo) {
    return { erro: "Usuário não encontrado ou inativo." };
  }

  const ok = await verifyPassword(senha, user.senhaHash);
  if (!ok) {
    return { erro: "Senha incorreta." };
  }

  await createSession({
    userId: user.id,
    matricula: user.matricula,
    nome: user.nome,
    role: user.role,
  });

  redirect("/painel");
}
