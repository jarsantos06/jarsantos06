import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession, type SessionPayload } from "./session";
import { can, type Permission } from "./rbac";

/**
 * Retorna o usuário atual (revalidado no banco) ou redireciona para o login.
 *
 * Revalidar contra o banco garante que uma conta desativada ou com papel
 * alterado perca acesso imediatamente, em vez de continuar com os dados
 * "congelados" no JWT por até 8h.
 */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, matricula: true, nome: true, role: true, ativo: true },
  });

  if (!user || !user.ativo) {
    // Cookies não podem ser modificados durante a renderização (Server
    // Component) — apenas em Server Action ou Route Handler. Redireciona
    // para o handler de logout, que apaga a sessão e leva ao login.
    redirect("/api/auth/logout");
  }

  return {
    userId: user.id,
    matricula: user.matricula,
    nome: user.nome,
    role: user.role, // papel ATUAL do banco (não o do token)
  };
}

/**
 * Exige uma permissão específica. Se o usuário não a tiver,
 * redireciona para o painel com aviso de acesso negado.
 */
export async function requirePermission(
  permission: Permission,
): Promise<SessionPayload> {
  const session = await requireUser();
  if (!can(session.role, permission)) {
    redirect("/painel?erro=sem-permissao");
  }
  return session;
}
