import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";
import { can, type Permission } from "./rbac";

/** Retorna a sessão atual ou redireciona para o login. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
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
