import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card, Badge, btn } from "@/components/ui";
import { MovimentarForm } from "../MovimentarForm";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await requirePermission("almoxarifado.ver");
  const podeMovimentar = can(sessao.permissoes, "almoxarifado.movimentar");
  const podeGerenciar = can(sessao.permissoes, "almoxarifado.gerenciar");
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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/painel/almoxarifado"
            className="text-sm text-brand-600 hover:underline"
          >
            ← Almoxarifado
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            {material.nome}
          </h1>
          <p className="font-mono text-sm text-slate-500">{material.codigo}</p>
        </div>
        {podeGerenciar && (
          <Link
            href={`/painel/almoxarifado/${material.id}/editar`}
            className={btn("secondary", "sm")}
          >
            ✏️ Editar
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Saldo + movimentação */}
        <div className="space-y-4">
          <Card className="p-5">
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
              {baixo && (
                <span className="ml-2 align-middle">
                  <Badge tone="red">estoque baixo</Badge>
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400">
              Estoque mínimo: {material.estoqueMinimo} {material.unidade}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold text-slate-800">
              Nova movimentação
            </h2>
            <MovimentarForm
              materialId={material.id}
              unidade={material.unidade}
              podeMovimentar={podeMovimentar}
            />
          </Card>
        </div>

        {/* Histórico */}
        <Card className="p-5">
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
        </Card>
      </div>
    </div>
  );
}
