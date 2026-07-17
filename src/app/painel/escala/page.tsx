import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { montarMes } from "@/lib/escala";
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/painel" className="text-sm text-brand-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            📅 Minha escala
          </h1>
          <p className="text-slate-500">{sessao.nome}</p>
        </div>
        {podeGerenciar && (
          <Link
            href="/painel/escala/gerenciar"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Gerenciar equipe
          </Link>
        )}
      </div>

      {semEscala ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
          Você ainda não tem escala definida.
          <br />
          Procure seu supervisor ou gerente.
        </div>
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
