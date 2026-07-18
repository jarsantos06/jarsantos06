import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui";
import { NovoFuncionarioForm } from "./NovoFuncionarioForm";

export default async function NovoFuncionarioPage() {
  await requirePermission("cadastros.gerenciar");

  const cargos = await db.cargo.findMany({
    where: { ativo: true },
    orderBy: { nivel: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        voltarHref="/painel/cadastros/funcionarios"
        voltarLabel="Funcionários"
        titulo="Novo funcionário"
      />
      <Card className="p-6">
        <NovoFuncionarioForm cargos={cargos} />
      </Card>
    </div>
  );
}
