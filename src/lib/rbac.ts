// ---------------------------------------------------------------------------
// RBAC dirigido pelo banco.
//
// Este arquivo define o CATÁLOGO de permissões que existem no sistema
// (cada uma protege uma funcionalidade concreta). QUEM possui cada
// permissão é definido por CARGO, no banco (módulo Cadastros) — editável
// pelo gestor na tela de cargos, sem precisar de programação.
// ---------------------------------------------------------------------------

export const CATALOGO_PERMISSOES = {
  // Almoxarifado
  "almoxarifado.ver": {
    label: "Consultar materiais e saldos",
    grupo: "📦 Almoxarifado",
  },
  "almoxarifado.movimentar": {
    label: "Registrar entrada e saída de materiais",
    grupo: "📦 Almoxarifado",
  },
  "almoxarifado.gerenciar": {
    label: "Cadastrar e editar materiais",
    grupo: "📦 Almoxarifado",
  },
  "almoxarifado.auditar": {
    label: "Ver auditoria de movimentações",
    grupo: "📦 Almoxarifado",
  },

  // Travamento de Carreta
  "carreta.ver": {
    label: "Ver pátio e histórico de carretas",
    grupo: "🚛 Travamento de Carreta",
  },
  "carreta.operar": {
    label: "Travar e destravar carretas",
    grupo: "🚛 Travamento de Carreta",
  },

  // Ocorrências
  "ocorrencia.criar": {
    label: "Registrar faltas e atrasos",
    grupo: "📝 Ocorrências",
  },
  "ocorrencia.aprovar": {
    label: "Aprovar/reprovar ocorrências",
    grupo: "📝 Ocorrências",
  },

  // Escala
  "escala.ver": {
    label: "Ver a própria escala",
    grupo: "📅 Escala / Turnos",
  },
  "escala.gerenciar": {
    label: "Montar e editar escalas da equipe",
    grupo: "📅 Escala / Turnos",
  },

  // Cadastros
  "cadastros.ver": {
    label: "Consultar funcionários e cargos",
    grupo: "🗂️ Cadastros",
  },
  "cadastros.gerenciar": {
    label: "Cadastrar/editar funcionários, cargos e permissões",
    grupo: "🗂️ Cadastros",
  },
} as const;

export type Permission = keyof typeof CATALOGO_PERMISSOES;

export const PERMISSOES_TODAS = Object.keys(
  CATALOGO_PERMISSOES,
) as Permission[];

/** true se a permissão existe no catálogo (filtra entradas obsoletas do banco). */
export function ehPermissaoValida(p: string): p is Permission {
  return p in CATALOGO_PERMISSOES;
}

/** Verifica se um conjunto de permissões (vindo do banco) inclui a exigida. */
export function can(
  permissoes: readonly string[],
  permission: Permission,
): boolean {
  return permissoes.includes(permission);
}

/** Agrupa o catálogo por módulo — usado para montar a tela de cargos. */
export function catalogoPorGrupo(): {
  grupo: string;
  permissoes: { chave: Permission; label: string }[];
}[] {
  const grupos = new Map<string, { chave: Permission; label: string }[]>();
  for (const chave of PERMISSOES_TODAS) {
    const { label, grupo } = CATALOGO_PERMISSOES[chave];
    const arr = grupos.get(grupo) ?? [];
    arr.push({ chave, label });
    grupos.set(grupo, arr);
  }
  return [...grupos.entries()].map(([grupo, permissoes]) => ({
    grupo,
    permissoes,
  }));
}

// ---------------------------------------------------------------------------
// Cargos padrão (usados pelo seed). Depois de criados, tudo é editável na UI.
// ---------------------------------------------------------------------------
const BASE: Permission[] = ["ocorrencia.criar", "escala.ver"];
const OPERACAO: Permission[] = [
  ...BASE,
  "almoxarifado.ver",
  "almoxarifado.movimentar",
  "carreta.ver",
  "carreta.operar",
];

export const CARGOS_PADRAO: {
  nome: string;
  nivel: number;
  permissoes: Permission[];
}[] = [
  { nome: "Assistente de Logística N1", nivel: 1, permissoes: BASE },
  { nome: "Assistente de Logística N2", nivel: 2, permissoes: BASE },
  { nome: "Assistente de Logística N3", nivel: 3, permissoes: BASE },
  { nome: "Controlador", nivel: 4, permissoes: OPERACAO },
  { nome: "Encarregado N1", nivel: 5, permissoes: OPERACAO },
  { nome: "Encarregado N2", nivel: 6, permissoes: OPERACAO },
  { nome: "Encarregado N3", nivel: 7, permissoes: OPERACAO },
  {
    nome: "Supervisor",
    nivel: 8,
    permissoes: [
      ...BASE,
      "almoxarifado.ver",
      "almoxarifado.movimentar",
      "almoxarifado.gerenciar",
      "almoxarifado.auditar",
      "carreta.ver",
      "ocorrencia.aprovar",
      "escala.gerenciar",
      "cadastros.ver",
    ],
  },
  {
    nome: "Gerente",
    nivel: 9,
    permissoes: [
      ...BASE,
      "almoxarifado.ver",
      "carreta.ver",
      "ocorrencia.aprovar",
      "escala.gerenciar",
      "cadastros.ver",
      "cadastros.gerenciar",
    ],
  },
];
