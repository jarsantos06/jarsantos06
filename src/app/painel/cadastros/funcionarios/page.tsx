import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import {
  PageHeader,
  Card,
  Badge,
  EmptyState,
  Input,
  Alert,
  btn,
} from "@/components/ui";

export default async function FuncionariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; ok?: string }>;
}) {
  const sessao = await requirePermission("cadastros.ver");
  const podeGerenciar = can(sessao.permissoes, "cadastros.gerenciar");

  const { q, status, ok } = await searchParams;
  const busca = (q ?? "").trim();
  const soInativos = status === "inativos";

  const funcionarios = await db.user.findMany({
    where: {
      ...(soInativos ? { ativo: false } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca } },
              { matricula: { contains: busca } },
            ],
          }
        : {}),
    },
    include: { cargo: { select: { nome: true } } },
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        voltarHref="/painel/cadastros"
        voltarLabel="Cadastros"
        titulo="👥 Funcionários"
        subtitulo={`${funcionarios.length} registro(s)${soInativos ? " inativos" : ""}`}
        acoes={
          podeGerenciar ? (
            <Link
              href="/painel/cadastros/funcionarios/novo"
              className={btn("primary", "sm")}
            >
              + Novo funcionário
            </Link>
          ) : undefined
        }
      />

      {ok === "editado" && (
        <div className="mb-4">
          <Alert tone="success">Funcionário atualizado com sucesso.</Alert>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form method="get" className="flex flex-1 gap-2">
          {soInativos && <input type="hidden" name="status" value="inativos" />}
          <Input
            name="q"
            defaultValue={busca}
            placeholder="Buscar por nome ou matrícula..."
          />
          <button type="submit" className={btn("secondary")}>
            Buscar
          </button>
        </form>
        <div className="flex gap-1">
          <Link
            href="/painel/cadastros/funcionarios"
            className={btn(!soInativos ? "primary" : "ghost", "sm")}
          >
            Todos
          </Link>
          <Link
            href="/painel/cadastros/funcionarios?status=inativos"
            className={btn(soInativos ? "primary" : "ghost", "sm")}
          >
            Inativos
          </Link>
        </div>
      </div>

      {funcionarios.length === 0 ? (
        <EmptyState
          emoji="👤"
          titulo="Nenhum funcionário encontrado"
          descricao="Ajuste a busca ou cadastre um novo funcionário."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Matrícula</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cargo</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funcionarios.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {f.matricula}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {f.nome}
                    {f.id === sessao.userId && (
                      <span className="ml-2">
                        <Badge tone="brand">você</Badge>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {f.cargo?.nome ?? "Sem cargo"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={f.ativo ? "green" : "red"}>
                      {f.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {podeGerenciar && (
                      <Link
                        href={`/painel/cadastros/funcionarios/${f.id}`}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        Editar →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
