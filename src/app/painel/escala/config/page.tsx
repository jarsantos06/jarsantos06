import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { NovoTurnoForm, NovoPadraoForm } from "./ConfigForms";

export default async function ConfigEscalaPage() {
  await requirePermission("escala.gerenciar");

  const [turnos, padroes] = await Promise.all([
    db.turno.findMany({ orderBy: { nome: "asc" } }),
    db.padraoEscala.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/painel/escala/gerenciar"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Equipe
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-slate-800">
        ⚙️ Turnos e padrões
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Turnos */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">Turnos</h2>
            <ul className="mb-4 space-y-2 text-sm">
              {turnos.map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="font-medium text-slate-700">{t.nome}</span>
                  <span className="text-slate-500">
                    {t.horaInicio}–{t.horaFim}
                  </span>
                </li>
              ))}
            </ul>
            <NovoTurnoForm />
          </div>
        </div>

        {/* Padrões */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">Padrões</h2>
            <ul className="mb-4 space-y-2 text-sm">
              {padroes.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="font-medium text-slate-700">{p.nome}</span>
                  <span className="text-slate-500">
                    {p.diasTrabalho} trab. / {p.diasFolga} folga
                  </span>
                </li>
              ))}
            </ul>
            <NovoPadraoForm />
          </div>
        </div>
      </div>
    </div>
  );
}
