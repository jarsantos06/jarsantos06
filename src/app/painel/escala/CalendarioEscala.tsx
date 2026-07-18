import Link from "next/link";
import type { DiaEscala } from "@/lib/escala";
import { NOMES_MES, primeiroDiaSemanaDoMes } from "@/lib/escala";
import { Card, cx } from "@/components/ui";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Paleta por turno: Diurno = âmbar (sol), Noturno = índigo (noite);
// outros turnos recebem cores estáveis pela ordem de aparição.
const CORES_TURNO = [
  {
    celula: "border-amber-200 bg-amber-50",
    texto: "text-amber-800",
    sub: "text-amber-600",
    dot: "bg-amber-400",
  },
  {
    celula: "border-indigo-200 bg-indigo-50",
    texto: "text-indigo-800",
    sub: "text-indigo-600",
    dot: "bg-indigo-500",
  },
  {
    celula: "border-emerald-200 bg-emerald-50",
    texto: "text-emerald-800",
    sub: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    celula: "border-rose-200 bg-rose-50",
    texto: "text-rose-800",
    sub: "text-rose-600",
    dot: "bg-rose-400",
  },
  {
    celula: "border-cyan-200 bg-cyan-50",
    texto: "text-cyan-800",
    sub: "text-cyan-600",
    dot: "bg-cyan-500",
  },
];

function mapaCoresTurnos(dias: DiaEscala[]) {
  const nomes: string[] = [];
  for (const d of dias) {
    if (d.turnoNome && !nomes.includes(d.turnoNome)) nomes.push(d.turnoNome);
  }
  // "Diurno" e "Noturno" têm cores fixas; demais seguem a ordem
  const mapa = new Map<string, (typeof CORES_TURNO)[number]>();
  let proxima = 2;
  for (const nome of nomes) {
    if (/diurno/i.test(nome)) mapa.set(nome, CORES_TURNO[0]);
    else if (/noturno/i.test(nome)) mapa.set(nome, CORES_TURNO[1]);
    else mapa.set(nome, CORES_TURNO[proxima++ % CORES_TURNO.length]);
  }
  return mapa;
}

export function CalendarioEscala({
  dias,
  ano,
  mes,
  basePath,
}: {
  dias: DiaEscala[];
  ano: number;
  mes: number; // 1-12
  basePath: string;
}) {
  const totalTrab = dias.filter((d) => d.trabalha).length;
  const totalFolga = dias.length - totalTrab;
  const primeiroDiaSemana = primeiroDiaSemanaDoMes(ano, mes);
  const cores = mapaCoresTurnos(dias);

  const agora = new Date();
  const hojeNumero =
    agora.getFullYear() === ano && agora.getMonth() + 1 === mes
      ? agora.getDate()
      : null;

  const mesAnt = mes === 1 ? 12 : mes - 1;
  const anoAnt = mes === 1 ? ano - 1 : ano;
  const mesProx = mes === 12 ? 1 : mes + 1;
  const anoProx = mes === 12 ? ano + 1 : ano;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`${basePath}?ano=${anoAnt}&mes=${mesAnt}`}
          aria-label="Mês anterior"
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          ←
        </Link>
        <h2 className="text-center font-semibold text-slate-800">
          {NOMES_MES[mes - 1]} de {ano}
        </h2>
        <Link
          href={`${basePath}?ano=${anoProx}&mes=${mesProx}`}
          aria-label="Próximo mês"
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          →
        </Link>
      </div>

      {/* Resumo do mês */}
      <div className="mb-4 flex justify-center gap-4 text-sm">
        <span className="text-slate-600">
          <strong className="text-slate-800">{totalTrab}</strong> dia(s) de
          trabalho
        </span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-600">
          <strong className="text-slate-800">{totalFolga}</strong> folga(s)
        </span>
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
          const cor = d.turnoNome ? cores.get(d.turnoNome) : undefined;
          const ehHoje = d.numero === hojeNumero;
          return (
            <div
              key={d.numero}
              className={cx(
                "rounded-lg border p-1.5 text-center",
                d.trabalha && cor ? cor.celula : "border-slate-100 bg-slate-50",
                ehHoje && "ring-2 ring-brand-500 ring-offset-1",
              )}
              title={
                d.trabalha
                  ? `${d.turnoNome} ${d.turnoInicio}–${d.turnoFim}`
                  : "Folga"
              }
            >
              <div
                className={cx(
                  "text-sm",
                  d.trabalha && cor
                    ? `font-semibold ${cor.texto}`
                    : "text-slate-400",
                )}
              >
                {d.numero}
              </div>
              {d.trabalha && cor ? (
                <div className={cx("text-[10px] leading-tight", cor.sub)}>
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

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {[...cores.entries()].map(([nome, cor]) => (
          <span key={nome} className="flex items-center gap-1.5">
            <span
              className={cx("inline-block h-2.5 w-2.5 rounded-full", cor.dot)}
            />
            {nome}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-200" />
          Folga
        </span>
        {hojeNumero && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-brand-500" />
            Hoje
          </span>
        )}
      </div>
    </Card>
  );
}
