import type { StatusOcorrencia, TipoOcorrencia } from "@prisma/client";
import { Badge } from "@/components/ui";

const STATUS: Record<
  StatusOcorrencia,
  { label: string; tone: "amber" | "green" | "red" }
> = {
  PENDENTE: { label: "Pendente", tone: "amber" },
  APROVADA: { label: "Aprovada", tone: "green" },
  REPROVADA: { label: "Reprovada", tone: "red" },
};

export function StatusBadge({ status }: { status: StatusOcorrencia }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function tipoLabel(tipo: TipoOcorrencia): string {
  return tipo === "FALTA" ? "Falta" : "Atraso";
}
