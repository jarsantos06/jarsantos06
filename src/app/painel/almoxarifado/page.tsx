import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";

const CATEGORIA_LABEL: Record<string, string> = {
  USO_DIARIO: "Uso diário",
  LIMPEZA: "Limpeza",
};

export default async function AlmoxarifadoPage() {
  const sessao = await requirePermission("almoxarifado.ver");
  const podeGerenciar = can(sessao.role, "almoxarifado.gerenciar");
  const podeAuditar = can(sessao.role, "almoxarifado.auditar");

  const materiais = await db.material.findMany({
    where: { ativo: true },
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/painel"
            className="text-sm text-brand-600 hover:underline"
          >
            ← Painel
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            📦 Almoxarifado
          </h1>
          <p className="text-slate-500">Materiais de uso diário e limpeza</p>
        </div>
        <div className="flex gap-2">
          {podeAuditar && (
            <Link
              href="/painel/almoxarifado/auditoria"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              📊 Auditoria
            </Link>
          )}
          {podeGerenciar && (
            <Link
              href="/painel/almoxarifado/novo"
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Novo material
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 text-right font-medium">Saldo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materiais.map((m) => {
              const baixo = m.saldo <= m.estoqueMinimo;
              return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {m.codigo}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {m.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {CATEGORIA_LABEL[m.categoria]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        baixo
                          ? "font-semibold text-red-600"
                          : "font-semibold text-slate-800"
                      }
                    >
                      {m.saldo} {m.unidade}
                    </span>
                    {baixo && (
                      <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">
                        estoque baixo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/painel/almoxarifado/${m.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Movimentar →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {materiais.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhum material cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
