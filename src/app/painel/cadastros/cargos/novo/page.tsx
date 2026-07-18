import { requirePermission } from "@/lib/auth";
import { catalogoPorGrupo } from "@/lib/rbac";
import { PageHeader, Card } from "@/components/ui";
import { CargoForm } from "../CargoForm";

export default async function NovoCargoPage() {
  await requirePermission("cadastros.gerenciar");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        voltarHref="/painel/cadastros/cargos"
        voltarLabel="Cargos"
        titulo="Novo cargo"
        subtitulo="Defina o nome e marque as regras de negócio do cargo"
      />
      <Card className="p-6">
        <CargoForm grupos={catalogoPorGrupo()} />
      </Card>
    </div>
  );
}
