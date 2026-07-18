// Tratamento consistente de DATAS CIVIS (sem horário/fuso), como a data de
// uma ocorrência ou a âncora de uma escala.
//
// `<input type="date">` envia "YYYY-MM-DD". `new Date("YYYY-MM-DD")` é
// interpretado como meia-noite UTC; se o restante do código usar getters
// locais, em fusos negativos (ex.: America/Sao_Paulo, UTC-3) o dia "volta"
// um dia. A solução: ancorar tudo em UTC — parsear em UTC e exibir em UTC.

/** Converte "YYYY-MM-DD" em um Date à meia-noite UTC. Retorna null se inválido. */
export function parseCivilDate(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  // valida (ex.: rejeita 2026-02-31, que "estouraria" para março)
  if (
    d.getUTCFullYear() !== ano ||
    d.getUTCMonth() !== mes - 1 ||
    d.getUTCDate() !== dia
  ) {
    return null;
  }
  return d;
}

/** Formata uma data civil em pt-BR sem deslocar por fuso (lê em UTC). */
export function formatCivil(d: Date): string {
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
