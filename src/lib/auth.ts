import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession } from "./session";
import { can, ehPermissaoValida, type Permission } from "./rbac";

/** Usuário autenticado com cargo e permissões atuais (revalidados no banco). */
export type UsuarioAtual = {
  userId: string;
  matricula: string;
  nome: string;
  cargoId: string | null;
  cargoNome: string;
  permissoes: Permission[];
};

/**
 * Retorna o usuário atual ou redireciona para o login.
 *
 * Revalida no banco a cada requisição: conta desativada perde acesso na
 * hora, e mudanças de cargo/permissões (módulo Cadastros) valem
 * imediatamente. Cargo desativado ou ausente = sem permissões.
 */
export async function requireUser(): Promise<UsuarioAtual> {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      matricula: true,
      nome: true,
      ativo: true,
      cargo: {
        select: {
          id: true,
          nome: true,
          ativo: true,
          permissoes: { select: { permissao: true } },
        },
      },
    },
  });

  if (!user || !user.ativo) {
    // Cookies não podem ser modificados durante a renderização (Server
    // Component) — apenas em Server Action ou Route Handler. Redireciona
    // para o handler de logout, que apaga a sessão e leva ao login.
    redirect("/api/auth/logout");
  }

  const permissoes =
    user.cargo && user.cargo.ativo
      ? user.cargo.permissoes.map((p) => p.permissao).filter(ehPermissaoValida)
      : [];

  return {
    userId: user.id,
    matricula: user.matricula,
    nome: user.nome,
    cargoId: user.cargo?.id ?? null,
    cargoNome: user.cargo?.nome ?? "Sem cargo",
    permissoes,
  };
}

/**
 * Exige uma permissão específica. Se o usuário não a tiver,
 * redireciona para o painel com aviso de acesso negado.
 */
export async function requirePermission(
  permission: Permission,
): Promise<UsuarioAtual> {
  const user = await requireUser();
  if (!can(user.permissoes, permission)) {
    redirect("/painel?erro=sem-permissao");
  }
  return user;
}
