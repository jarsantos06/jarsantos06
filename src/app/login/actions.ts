"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export type LoginState = { erro?: string };

// Hash "isca" (não corresponde a nenhuma senha). Usado quando a matrícula não
// existe, para que verifyPassword rode do mesmo jeito e o tempo de resposta
// não denuncie se a matrícula é válida (evita enumeração por timing).
const HASH_DUMMY =
  "$2a$10$pvouiJN9WyA6eJ1Kqi5.9uA9uBS7Nu/YNhgYQGRWXLtq.ZQ6r495G";

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
  const senhaConfere = await verifyPassword(
    senha,
    user?.senhaHash ?? HASH_DUMMY,
  );

  // Mensagem genérica e única — não revela se a matrícula existe ou está inativa.
  if (!user || !user.ativo || !senhaConfere) {
    return { erro: "Matrícula ou senha inválidos." };
  }

  await createSession({
    userId: user.id,
    matricula: user.matricula,
    nome: user.nome,
    role: user.role,
  });

  redirect("/painel");
}
