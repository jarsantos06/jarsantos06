import { requirePermission } from "@/lib/auth";
import { EmConstrucao } from "@/components/EmConstrucao";

export default async function AlmoxarifadoPage() {
  await requirePermission("almoxarifado.ver");
  return <EmConstrucao titulo="Almoxarifado" emoji="📦" />;
}
