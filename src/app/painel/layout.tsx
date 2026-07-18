import { requireUser } from "@/lib/auth";
import { can, roleLabel } from "@/lib/rbac";
import { MODULOS } from "@/lib/navigation";
import { Logo } from "@/components/ui";
import { NavLinks, type NavItem } from "./_components/NavLinks";
import { MobileNav } from "./_components/MobileNav";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const modulosVisiveis = MODULOS.filter((m) => can(user.role, m.permissao));

  const itens: NavItem[] = [
    { href: "/painel", label: "Início", emoji: "🏠" },
    ...modulosVisiveis.map((m) => ({
      href: m.href,
      label: m.titulo,
      emoji: m.emoji,
    })),
  ];

  const papel = roleLabel(user.role);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-100 md:flex">
        <div className="px-5 py-5">
          <Logo tone="onDark" tagline />
        </div>

        <div className="flex-1 px-3 py-2">
          <NavLinks items={itens} />
        </div>

        <div className="border-t border-slate-800 px-5 py-4 text-sm">
          <p className="font-medium">{user.nome}</p>
          <p className="text-xs text-slate-400">
            {papel} · {user.matricula}
          </p>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav
              items={itens}
              userNome={user.nome}
              userPapel={papel}
              userMatricula={user.matricula}
            />
            <span className="text-sm text-slate-500 md:hidden">
              {user.nome.split(" ")[0]} · {papel}
            </span>
          </div>
          <span className="hidden text-sm text-slate-400 md:block">
            Portal de gestão operacional
          </span>
          <form
            action="/api/auth/logout"
            method="post"
            className="hidden md:block"
          >
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Sair
            </button>
          </form>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
