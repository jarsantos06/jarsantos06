import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { can, roleLabel } from "@/lib/rbac";
import { MODULOS } from "@/lib/navigation";

export default async function PainelHome({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await requireUser();
  const { erro } = await searchParams;
  const modulos = MODULOS.filter((m) => can(user.role, m.permissao));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Olá, {user.nome.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500">
          Perfil de acesso: <strong>{roleLabel(user.role)}</strong>
        </p>
      </div>

      {erro === "sem-permissao" && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Você não tem permissão para acessar esse módulo.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <Link
            key={m.chave}
            href={m.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="mb-3 text-3xl">{m.emoji}</div>
            <h2 className="font-semibold text-slate-800 group-hover:text-brand-700">
              {m.titulo}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{m.descricao}</p>
          </Link>
        ))}
      </div>

      {modulos.length === 0 && (
        <p className="text-slate-500">
          Nenhum módulo disponível para o seu perfil no momento.
        </p>
      )}
    </div>
  );
}
