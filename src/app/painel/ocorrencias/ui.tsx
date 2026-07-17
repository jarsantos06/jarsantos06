import type { StatusOcorrencia, TipoOcorrencia } from "@prisma/client";

const STATUS: Record<StatusOcorrencia, { label: string; cls: string }> = {
  PENDENTE: { label: "Pendente", cls: "bg-amber-50 text-amber-700" },
  APROVADA: { label: "Aprovada", cls: "bg-green-50 text-green-700" },
  REPROVADA: { label: "Reprovada", cls: "bg-red-50 text-red-600" },
};

export function StatusBadge({ status }: { status: StatusOcorrencia }) {
  const s = STATUS[status];
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function tipoLabel(tipo: TipoOcorrencia): string {
  return tipo === "FALTA" ? "Falta" : "Atraso";
}
