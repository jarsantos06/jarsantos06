// ---------------------------------------------------------------------------
// Cálculo de escala. Funções puras (sem I/O) para facilitar teste.
//
// A ideia central: a escala não guarda dia a dia. Ela guarda o PADRÃO
// (ex.: 2x2) e a DATA DE INÍCIO (âncora). A partir daí o sistema calcula
// se o funcionário trabalha ou folga em qualquer data — então a escala
// "se repete sozinha" (padronizada) até uma nova atribuição substituí-la.
// ---------------------------------------------------------------------------

const MS_DIA = 86_400_000;

/**
 * Diferença em dias inteiros entre duas datas civis.
 * Usa getters UTC — as datas civis são ancoradas em UTC (ver lib/date.ts),
 * então o cálculo fica imune ao fuso do servidor.
 */
function diasEntre(a: Date, b: Date): number {
  const ua = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const ub = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((ub - ua) / MS_DIA);
}

/**
 * Dado o padrão (diasTrabalho x diasFolga) e a âncora (dataInicio),
 * retorna true se o funcionário TRABALHA no dia informado.
 */
export function trabalhaNoDia(
  dataInicio: Date,
  diasTrabalho: number,
  diasFolga: number,
  dia: Date,
): boolean {
  const ciclo = diasTrabalho + diasFolga;
  if (ciclo <= 0) return false;
  const offset = diasEntre(dataInicio, dia);
  if (offset < 0) return false; // antes do início da escala
  return offset % ciclo < diasTrabalho;
}

export type AtribuicaoEscala = {
  dataInicio: Date;
  dataFim: Date | null;
  diasTrabalho: number;
  diasFolga: number;
  turnoNome: string;
  turnoInicio: string;
  turnoFim: string;
};

/** Verifica se uma atribuição está vigente na data. */
function vigenteEm(a: AtribuicaoEscala, dia: Date): boolean {
  if (diasEntre(a.dataInicio, dia) < 0) return false;
  if (a.dataFim && diasEntre(dia, a.dataFim) < 0) return false;
  return true;
}

/**
 * Entre várias atribuições do mesmo funcionário, escolhe a que vale no dia:
 * a vigente com a dataInicio mais recente (a mais nova "manda").
 */
export function atribuicaoDoDia(
  atribuicoes: AtribuicaoEscala[],
  dia: Date,
): AtribuicaoEscala | null {
  let escolhida: AtribuicaoEscala | null = null;
  for (const a of atribuicoes) {
    if (!vigenteEm(a, dia)) continue;
    if (!escolhida || a.dataInicio > escolhida.dataInicio) escolhida = a;
  }
  return escolhida;
}

export type DiaEscala = {
  numero: number; // dia do mês (1-31), já resolvido em UTC
  trabalha: boolean;
  turnoNome?: string;
  turnoInicio?: string;
  turnoFim?: string;
};

/** Monta o mês (ano, mes 1-12) de um funcionário a partir de suas atribuições. */
export function montarMes(
  atribuicoes: AtribuicaoEscala[],
  ano: number,
  mes: number, // 1-12
): DiaEscala[] {
  const totalDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate(); // último dia
  const resultado: DiaEscala[] = [];

  for (let d = 1; d <= totalDias; d++) {
    const dia = new Date(Date.UTC(ano, mes - 1, d));
    const a = atribuicaoDoDia(atribuicoes, dia);
    if (!a) {
      resultado.push({ numero: d, trabalha: false });
      continue;
    }
    const trabalha = trabalhaNoDia(
      a.dataInicio,
      a.diasTrabalho,
      a.diasFolga,
      dia,
    );
    resultado.push({
      numero: d,
      trabalha,
      turnoNome: trabalha ? a.turnoNome : undefined,
      turnoInicio: trabalha ? a.turnoInicio : undefined,
      turnoFim: trabalha ? a.turnoFim : undefined,
    });
  }
  return resultado;
}

/** Dia da semana (0=Dom..6=Sáb) do 1º dia do mês, em UTC. */
export function primeiroDiaSemanaDoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
}

export const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
