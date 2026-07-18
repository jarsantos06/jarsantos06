import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui";
import { EditarFuncionarioForm } from "./EditarFuncionarioForm";

export default async function EditarFuncionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await requirePermission("cadastros.gerenciar");
  const { id } = await params;

  const [funcionario, cargos] = await Promise.all([
    db.user.findUnique({
      where: { id },
      select: {
        id: true,
        matricula: true,
        nome: true,
        email: true,
        cargoId: true,
        ativo: true,
      },
    }),
    db.cargo.findMany({
      where: { ativo: true },
      orderBy: { nivel: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  if (!funcionario) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        voltarHref="/painel/cadastros/funcionarios"
        voltarLabel="Funcionários"
        titulo={funcionario.nome}
        subtitulo={`Matrícula ${funcionario.matricula}`}
      />
      <Card className="p-6">
        <EditarFuncionarioForm
          funcionario={funcionario}
          cargos={cargos}
          ehProprio={funcionario.id === sessao.userId}
        />
      </Card>
    </div>
  );
}
