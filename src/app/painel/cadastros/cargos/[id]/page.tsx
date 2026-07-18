import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { catalogoPorGrupo } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui";
import { CargoForm } from "../CargoForm";

export default async function EditarCargoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await requirePermission("cadastros.gerenciar");
  const { id } = await params;

  const cargo = await db.cargo.findUnique({
    where: { id },
    include: {
      permissoes: { select: { permissao: true } },
      _count: { select: { usuarios: true } },
    },
  });

  if (!cargo) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        voltarHref="/painel/cadastros/cargos"
        voltarLabel="Cargos"
        titulo={cargo.nome}
        subtitulo={`${cargo._count.usuarios} funcionário(s) neste cargo — mudanças valem imediatamente`}
      />
      <Card className="p-6">
        <CargoForm
          grupos={catalogoPorGrupo()}
          ehCargoProprio={cargo.id === sessao.cargoId}
          cargo={{
            id: cargo.id,
            nome: cargo.nome,
            nivel: cargo.nivel,
            ativo: cargo.ativo,
            permissoes: cargo.permissoes.map((p) => p.permissao),
          }}
        />
      </Card>
    </div>
  );
}
