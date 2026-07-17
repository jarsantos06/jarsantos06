import type { Permission } from "./rbac";

export type ModuloNav = {
  chave: string;
  titulo: string;
  descricao: string;
  href: string;
  emoji: string;
  // Permissão mínima para ENXERGAR o módulo no portal
  permissao: Permission;
};

// Registro central de módulos. Novos módulos entram aqui.
export const MODULOS: ModuloNav[] = [
  {
    chave: "almoxarifado",
    titulo: "Almoxarifado",
    descricao: "Entrada e saída de materiais de uso diário e limpeza",
    href: "/painel/almoxarifado",
    emoji: "📦",
    permissao: "almoxarifado.ver",
  },
  {
    chave: "carreta",
    titulo: "Travamento de Carreta",
    descricao: "Travar e destravar carretas no pátio com foto e ticket",
    href: "/painel/carreta",
    emoji: "🚛",
    permissao: "carreta.ver",
  },
  {
    chave: "ocorrencias",
    titulo: "Ocorrências",
    descricao: "Registrar e aprovar faltas e atrasos",
    href: "/painel/ocorrencias",
    emoji: "📝",
    permissao: "ocorrencia.criar",
  },
  {
    chave: "escala",
    titulo: "Escala / Turnos",
    descricao: "Escalas de trabalho por padrão (2x2, 6x1, 5x2) e turno",
    href: "/painel/escala",
    emoji: "📅",
    permissao: "escala.ver",
  },
];
