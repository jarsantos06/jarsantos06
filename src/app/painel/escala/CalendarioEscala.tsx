import Link from "next/link";
import type { DiaEscala } from "@/lib/escala";
import { NOMES_MES, primeiroDiaSemanaDoMes } from "@/lib/escala";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarioEscala({
  dias,
  ano,
  mes,
  basePath,
}: {
  dias: DiaEscala[];
  ano: number;
  mes: number; // 1-12
  basePath: string; // ex.: /painel/escala  ou  /painel/escala/gerenciar/<id>
}) {
  const totalTrab = dias.filter((d) => d.trabalha).length;

  // Deslocamento do 1º dia (para alinhar na coluna do dia da semana)
  const primeiroDiaSemana = primeiroDiaSemanaDoMes(ano, mes);

  const mesAnt = mes === 1 ? 12 : mes - 1;
  const anoAnt = mes === 1 ? ano - 1 : ano;
  const mesProx = mes === 12 ? 1 : mes + 1;
  const anoProx = mes === 12 ? ano + 1 : ano;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`${basePath}?ano=${anoAnt}&mes=${mesAnt}`}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          ←
        </Link>
        <h2 className="font-semibold text-slate-800">
          {NOMES_MES[mes - 1]} de {ano}
          <span className="ml-2 text-sm font-normal text-slate-400">
            {totalTrab} dia(s) de trabalho
          </span>
        </h2>
        <Link
          href={`${basePath}?ano=${anoProx}&mes=${mesProx}`}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
          <div key={`vazio-${i}`} />
        ))}
        {dias.map((d) => {
          const numero = d.numero;
          return (
            <div
              key={numero}
              className={
                d.trabalha
                  ? "rounded-lg border border-brand-200 bg-brand-50 p-1.5 text-center"
                  : "rounded-lg border border-slate-100 bg-slate-50 p-1.5 text-center"
              }
              title={
                d.trabalha
                  ? `${d.turnoNome} ${d.turnoInicio}–${d.turnoFim}`
                  : "Folga"
              }
            >
              <div
                className={
                  d.trabalha
                    ? "text-sm font-semibold text-brand-800"
                    : "text-sm text-slate-400"
                }
              >
                {numero}
              </div>
              {d.trabalha ? (
                <div className="text-[10px] leading-tight text-brand-600">
                  {d.turnoNome}
                </div>
              ) : (
                <div className="text-[10px] leading-tight text-slate-300">
                  folga
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-brand-200 bg-brand-50" />
          Trabalho
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-slate-100 bg-slate-50" />
          Folga
        </span>
      </div>
    </div>
  );
}
