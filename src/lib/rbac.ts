import type { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// Definição central de papéis e permissões.
// Toda regra "quem pode fazer o quê" vive AQUI — cada módulo apenas consulta.
// ---------------------------------------------------------------------------

export const ROLES: Record<Role, { label: string; nivel: number }> = {
  FUNCIONARIO: { label: "Funcionário", nivel: 1 },
  CONTROLADOR: { label: "Controlador", nivel: 2 },
  ENCARREGADO: { label: "Encarregado", nivel: 3 },
  SUPERVISOR: { label: "Supervisor", nivel: 4 },
  GERENTE: { label: "Gerente", nivel: 5 },
};

// Permissões nomeadas por módulo.action
export type Permission =
  // Módulo Almoxarifado
  | "almoxarifado.ver"
  | "almoxarifado.movimentar"
  | "almoxarifado.gerenciar" // cadastrar/editar materiais
  | "almoxarifado.auditar"
  // Módulo Carreta
  | "carreta.ver"
  | "carreta.operar" // travar / destravar
  // Módulo Ocorrências
  | "ocorrencia.criar"
  | "ocorrencia.aprovar"
  // Administração
  | "admin.usuarios";

const TODOS: Role[] = [
  "FUNCIONARIO",
  "CONTROLADOR",
  "ENCARREGADO",
  "SUPERVISOR",
  "GERENTE",
];

// Matriz de permissões conforme as regras do negócio
const PERMISSOES: Record<Permission, Role[]> = {
  // Almoxarifado — movimentam: Controlador, Encarregado, Supervisor; auditoria: só Supervisor
  "almoxarifado.ver": ["CONTROLADOR", "ENCARREGADO", "SUPERVISOR", "GERENTE"],
  "almoxarifado.movimentar": ["CONTROLADOR", "ENCARREGADO", "SUPERVISOR"],
  "almoxarifado.gerenciar": ["SUPERVISOR"],
  "almoxarifado.auditar": ["SUPERVISOR"],

  // Carreta — travam/destravam: Controlador e Encarregado
  "carreta.ver": ["CONTROLADOR", "ENCARREGADO", "SUPERVISOR", "GERENTE"],
  "carreta.operar": ["CONTROLADOR", "ENCARREGADO"],

  // Ocorrências — solicita: todos; aprova: Supervisor e Gerente
  "ocorrencia.criar": TODOS,
  "ocorrencia.aprovar": ["SUPERVISOR", "GERENTE"],

  // Administração de usuários — só Gerente
  "admin.usuarios": ["GERENTE"],
};

/** Verifica se um papel possui uma permissão. */
export function can(role: Role, permission: Permission): boolean {
  return PERMISSOES[permission].includes(role);
}

/** Lista as permissões de um papel (útil para montar a navegação). */
export function permissionsOf(role: Role): Permission[] {
  return (Object.keys(PERMISSOES) as Permission[]).filter((p) =>
    can(role, p),
  );
}

export function roleLabel(role: Role): string {
  return ROLES[role].label;
}
