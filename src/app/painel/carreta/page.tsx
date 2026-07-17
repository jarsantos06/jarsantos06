import { requirePermission } from "@/lib/auth";
import { EmConstrucao } from "@/components/EmConstrucao";

export default async function CarretaPage() {
  await requirePermission("carreta.ver");
  return <EmConstrucao titulo="Travamento de Carreta" emoji="🚛" />;
}
