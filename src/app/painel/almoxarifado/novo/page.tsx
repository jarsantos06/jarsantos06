import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { NovoMaterialForm } from "./NovoMaterialForm";

export default async function NovoMaterialPage() {
  await requirePermission("almoxarifado.gerenciar");

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/painel/almoxarifado"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Almoxarifado
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-slate-800">
        Novo material
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <NovoMaterialForm />
      </div>
    </div>
  );
}
