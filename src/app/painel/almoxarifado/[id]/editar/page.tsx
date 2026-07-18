import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { EditarMaterialForm } from "./EditarMaterialForm";

export default async function EditarMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("almoxarifado.gerenciar");
  const { id } = await params;

  const material = await db.material.findUnique({ where: { id } });
  if (!material) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/painel/almoxarifado/${material.id}`}
        className="text-sm text-brand-600 hover:underline"
      >
        ← {material.nome}
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-slate-800">
        Editar material
      </h1>
      <Card className="p-6">
        <EditarMaterialForm
          material={{
            id: material.id,
            nome: material.nome,
            categoria: material.categoria,
            unidade: material.unidade,
            estoqueMinimo: material.estoqueMinimo,
            ativo: material.ativo,
          }}
        />
      </Card>
      <p className="mt-3 text-xs text-slate-400">
        O saldo não é editado aqui — ele muda apenas por movimentação
        (entrada/saída), preservando a trilha de auditoria.
      </p>
    </div>
  );
}
