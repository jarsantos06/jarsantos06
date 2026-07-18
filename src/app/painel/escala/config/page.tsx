import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui";
import { NovoTurnoForm, NovoPadraoForm } from "./ConfigForms";

export default async function ConfigEscalaPage() {
  await requirePermission("escala.gerenciar");

  const [turnos, padroes] = await Promise.all([
    db.turno.findMany({ orderBy: { nome: "asc" } }),
    db.padraoEscala.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        voltarHref="/painel/escala/gerenciar"
        voltarLabel="Equipe"
        titulo="⚙️ Turnos e padrões"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Turnos */}
        <Card className="p-5">
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
        </Card>

        {/* Padrões */}
        <Card className="p-5">
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
        </Card>
      </div>
    </div>
  );
}
