import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { roleLabel } from "@/lib/rbac";
import { MODULOS } from "@/lib/navigation";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const modulosVisiveis = MODULOS.filter((m) => can(user.role, m.permissao));

  return (
    <div className="flex min-h-screen">
      {/* Barra lateral */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-100 md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold">
            SO
          </div>
          <span className="font-semibold">Sistema Operacional</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          <Link
            href="/painel"
            className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            🏠 Início
          </Link>
          {modulosVisiveis.map((m) => (
            <Link
              key={m.chave}
              href={m.href}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {m.emoji} {m.titulo}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-sm">
          <p className="font-medium">{user.nome}</p>
          <p className="text-xs text-slate-400">
            {roleLabel(user.role)} · {user.matricula}
          </p>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <span className="text-sm text-slate-500 md:hidden">
            {user.nome} · {roleLabel(user.role)}
          </span>
          <span className="hidden text-sm text-slate-400 md:block">
            Portal de gestão operacional
          </span>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Sair
            </button>
          </form>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
