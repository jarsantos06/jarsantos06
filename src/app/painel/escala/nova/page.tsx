import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { roleLabel } from "@/lib/rbac";
import { db } from "@/lib/db";
import { NovaEscalaForm } from "./NovaEscalaForm";

export default async function NovaEscalaPage({
  searchParams,
}: {
  searchParams: Promise<{ funcionarioId?: string }>;
}) {
  await requirePermission("escala.gerenciar");
  const { funcionarioId } = await searchParams;

  const [usuarios, padroes, turnos] = await Promise.all([
    db.user.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    db.padraoEscala.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    db.turno.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/painel/escala/gerenciar"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Equipe
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-slate-800">
        Nova escala
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <NovaEscalaForm
          funcionarioIdInicial={funcionarioId}
          funcionarios={usuarios.map((u) => ({
            id: u.id,
            label: `${u.nome} (${roleLabel(u.role)})`,
          }))}
          padroes={padroes.map((p) => ({
            id: p.id,
            label: `${p.nome} — ${p.diasTrabalho}x${p.diasFolga}`,
          }))}
          turnos={turnos.map((t) => ({
            id: t.id,
            label: `${t.nome} (${t.horaInicio}–${t.horaFim})`,
          }))}
        />
      </div>
    </div>
  );
}
