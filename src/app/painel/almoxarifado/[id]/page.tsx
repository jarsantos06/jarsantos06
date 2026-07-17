import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { MovimentarForm } from "../MovimentarForm";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await requirePermission("almoxarifado.ver");
  const podeMovimentar = can(sessao.role, "almoxarifado.movimentar");
  const { id } = await params;

  const material = await db.material.findUnique({
    where: { id },
    include: {
      movimentacoes: {
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { usuario: { select: { nome: true } } },
      },
    },
  });

  if (!material) notFound();

  const baixo = material.saldo <= material.estoqueMinimo;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/painel/almoxarifado"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Almoxarifado
      </Link>

      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">{material.nome}</h1>
        <p className="font-mono text-sm text-slate-500">{material.codigo}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Saldo + movimentação */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Saldo atual</p>
            <p
              className={
                baixo
                  ? "text-3xl font-bold text-red-600"
                  : "text-3xl font-bold text-slate-800"
              }
            >
              {material.saldo}{" "}
              <span className="text-lg font-normal text-slate-500">
                {material.unidade}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Estoque mínimo: {material.estoqueMinimo} {material.unidade}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-800">
              Nova movimentação
            </h2>
            <MovimentarForm
              materialId={material.id}
              unidade={material.unidade}
              podeMovimentar={podeMovimentar}
            />
          </div>
        </div>

        {/* Histórico */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">
            Últimas movimentações
          </h2>
          <ul className="space-y-3">
            {material.movimentacoes.map((mv) => (
              <li
                key={mv.id}
                className="flex items-start justify-between border-b border-slate-100 pb-3 text-sm last:border-0"
              >
                <div>
                  <span
                    className={
                      mv.tipo === "ENTRADA"
                        ? "font-medium text-green-700"
                        : "font-medium text-red-600"
                    }
                  >
                    {mv.tipo === "ENTRADA" ? "＋ Entrada" : "－ Saída"} ·{" "}
                    {mv.quantidade} {material.unidade}
                  </span>
                  <p className="text-xs text-slate-500">
                    {mv.usuario.nome}
                    {mv.destino ? ` · ${mv.destino}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>
                    {mv.createdAt.toLocaleDateString("pt-BR")}{" "}
                    {mv.createdAt.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>saldo: {mv.saldoApos}</div>
                </div>
              </li>
            ))}
            {material.movimentacoes.length === 0 && (
              <li className="text-sm text-slate-400">
                Nenhuma movimentação registrada.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
