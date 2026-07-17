import { requirePermission } from "@/lib/auth";
import { EmConstrucao } from "@/components/EmConstrucao";

export default async function OcorrenciasPage() {
  await requirePermission("ocorrencia.criar");
  return <EmConstrucao titulo="Ocorrências" emoji="📝" />;
}
