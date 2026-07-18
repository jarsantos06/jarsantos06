import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, StatCard } from "@/components/ui";

export default async function CadastrosPage() {
  await requirePermission("cadastros.ver");

  const [funcAtivos, funcInativos, cargosAtivos] = await Promise.all([
    db.user.count({ where: { ativo: true } }),
    db.user.count({ where: { ativo: false } }),
    db.cargo.count({ where: { ativo: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        voltarHref="/painel"
        voltarLabel="Painel"
        titulo="🗂️ Cadastros"
        subtitulo="Funcionários, cargos e permissões de acesso"
      />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label="Funcionários ativos"
          valor={funcAtivos}
          emoji="👥"
          tone="brand"
          href="/painel/cadastros/funcionarios"
        />
        <StatCard
          label="Inativos"
          valor={funcInativos}
          emoji="🚫"
          tone={funcInativos > 0 ? "amber" : "slate"}
          href="/painel/cadastros/funcionarios?status=inativos"
        />
        <StatCard
          label="Cargos"
          valor={cargosAtivos}
          emoji="🧩"
          tone="slate"
          href="/painel/cadastros/cargos"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/painel/cadastros/funcionarios"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
        >
          <div className="mb-3 text-3xl">👥</div>
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-700">
            Funcionários
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Cadastrar, editar cargo e situação, redefinir senha
          </p>
        </Link>
        <Link
          href="/painel/cadastros/cargos"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
        >
          <div className="mb-3 text-3xl">🧩</div>
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-700">
            Cargos e permissões
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Criar cargos (N1, N2, N3...) e marcar o que cada um pode fazer
          </p>
        </Link>
      </div>
    </div>
  );
}
