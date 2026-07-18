import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { montarMes } from "@/lib/escala";
import { PageHeader, EmptyState, btn } from "@/components/ui";
import { CalendarioEscala } from "./CalendarioEscala";
import { carregarAtribuicoes, resolverMes } from "./data";

export default async function EscalaPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const sessao = await requirePermission("escala.ver");
  const podeGerenciar = can(sessao.role, "escala.gerenciar");
  const { ano, mes } = resolverMes(await searchParams);

  const atribuicoes = await carregarAtribuicoes(sessao.userId);
  const dias = montarMes(atribuicoes, ano, mes);
  const semEscala = atribuicoes.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        voltarHref="/painel"
        voltarLabel="Painel"
        titulo="📅 Minha escala"
        subtitulo={sessao.nome}
        acoes={
          podeGerenciar ? (
            <Link
              href="/painel/escala/gerenciar"
              className={btn("primary", "sm")}
            >
              Gerenciar equipe
            </Link>
          ) : undefined
        }
      />

      {semEscala ? (
        <EmptyState
          emoji="🗓️"
          titulo="Você ainda não tem escala definida"
          descricao="Procure seu supervisor ou gerente."
        />
      ) : (
        <CalendarioEscala
          dias={dias}
          ano={ano}
          mes={mes}
          basePath="/painel/escala"
        />
      )}
    </div>
  );
}
