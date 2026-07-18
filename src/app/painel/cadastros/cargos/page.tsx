import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PageHeader, Card, Badge, Alert, btn } from "@/components/ui";

export default async function CargosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const sessao = await requirePermission("cadastros.ver");
  const podeGerenciar = can(sessao.permissoes, "cadastros.gerenciar");
  const { ok } = await searchParams;

  const cargos = await db.cargo.findMany({
    orderBy: [{ ativo: "desc" }, { nivel: "asc" }],
    include: {
      _count: { select: { usuarios: true, permissoes: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        voltarHref="/painel/cadastros"
        voltarLabel="Cadastros"
        titulo="🧩 Cargos e permissões"
        subtitulo="O que cada cargo pode fazer no sistema"
        acoes={
          podeGerenciar ? (
            <Link
              href="/painel/cadastros/cargos/novo"
              className={btn("primary", "sm")}
            >
              + Novo cargo
            </Link>
          ) : undefined
        }
      />

      {ok === "criado" && (
        <div className="mb-4">
          <Alert tone="success">Cargo criado com sucesso.</Alert>
        </div>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 text-right font-medium">Funcionários</th>
              <th className="px-4 py-3 text-right font-medium">Permissões</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargos.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {c.nome}
                  {c.id === sessao.cargoId && (
                    <span className="ml-2">
                      <Badge tone="brand">seu cargo</Badge>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {c._count.usuarios}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {c._count.permissoes}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={c.ativo ? "green" : "red"}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {podeGerenciar && (
                    <Link
                      href={`/painel/cadastros/cargos/${c.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Permissões →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
