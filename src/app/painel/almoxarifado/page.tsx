import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import {
  PageHeader,
  Card,
  Badge,
  EmptyState,
  StatCard,
  Input,
  btn,
} from "@/components/ui";

const CATEGORIA_LABEL: Record<string, string> = {
  USO_DIARIO: "Uso diário",
  LIMPEZA: "Limpeza",
};

export default async function AlmoxarifadoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sessao = await requirePermission("almoxarifado.ver");
  const podeGerenciar = can(sessao.role, "almoxarifado.gerenciar");
  const podeAuditar = can(sessao.role, "almoxarifado.auditar");

  const { q, cat } = await searchParams;
  const busca = (q ?? "").trim();
  const categoria = cat === "USO_DIARIO" || cat === "LIMPEZA" ? cat : undefined;

  const materiais = await db.material.findMany({
    where: {
      ativo: true,
      ...(categoria ? { categoria } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca } },
              { codigo: { contains: busca } },
            ],
          }
        : {}),
    },
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });

  const totalBaixo = materiais.filter((m) => m.saldo <= m.estoqueMinimo).length;

  const filtroLink = (c?: string) => {
    const p = new URLSearchParams();
    if (busca) p.set("q", busca);
    if (c) p.set("cat", c);
    const s = p.toString();
    return `/painel/almoxarifado${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        voltarHref="/painel"
        voltarLabel="Painel"
        titulo="📦 Almoxarifado"
        subtitulo="Materiais de uso diário e limpeza"
        acoes={
          <>
            {podeAuditar && (
              <Link
                href="/painel/almoxarifado/auditoria"
                className={btn("secondary", "sm")}
              >
                📊 Auditoria
              </Link>
            )}
            {podeGerenciar && (
              <Link
                href="/painel/almoxarifado/novo"
                className={btn("primary", "sm")}
              >
                + Novo material
              </Link>
            )}
          </>
        }
      />

      {/* Resumo */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Materiais ativos"
          valor={materiais.length}
          emoji="📦"
        />
        <StatCard
          label="Estoque baixo"
          valor={totalBaixo}
          emoji="⚠️"
          tone={totalBaixo > 0 ? "red" : "green"}
          hint="no mínimo ou abaixo"
        />
      </div>

      {/* Busca + filtro */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form method="get" className="flex flex-1 gap-2">
          {categoria && <input type="hidden" name="cat" value={categoria} />}
          <Input
            name="q"
            defaultValue={busca}
            placeholder="Buscar por nome ou código..."
          />
          <button type="submit" className={btn("secondary")}>
            Buscar
          </button>
        </form>
        <div className="flex gap-1">
          <Link
            href={filtroLink()}
            className={btn(!categoria ? "primary" : "ghost", "sm")}
          >
            Todos
          </Link>
          <Link
            href={filtroLink("USO_DIARIO")}
            className={btn(
              categoria === "USO_DIARIO" ? "primary" : "ghost",
              "sm",
            )}
          >
            Uso diário
          </Link>
          <Link
            href={filtroLink("LIMPEZA")}
            className={btn(categoria === "LIMPEZA" ? "primary" : "ghost", "sm")}
          >
            Limpeza
          </Link>
        </div>
      </div>

      {materiais.length === 0 ? (
        <EmptyState
          emoji="📭"
          titulo="Nenhum material encontrado"
          descricao={
            busca || categoria
              ? "Ajuste a busca ou o filtro."
              : "Cadastre o primeiro material."
          }
        />
      ) : (
        <Card className="overflow-x-auto">
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
                        <span className="ml-2">
                          <Badge tone="red">baixo</Badge>
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
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
