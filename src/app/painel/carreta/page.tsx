import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { TravarForm } from "./TravarForm";
import { DestravarButton } from "./DestravarButton";

export default async function CarretaPage() {
  const sessao = await requirePermission("carreta.ver");
  const podeOperar = can(sessao.role, "carreta.operar");

  const travadas = await db.travamento.findMany({
    where: { status: "TRAVADA" },
    orderBy: { travadoEm: "desc" },
    include: { operador: { select: { nome: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/painel" className="text-sm text-brand-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            🚛 Travamento de Carreta
          </h1>
          <p className="text-slate-500">
            {travadas.length} carreta(s) travada(s) no pátio
          </p>
        </div>
        <Link
          href="/painel/carreta/historico"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          🕑 Histórico
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário de travamento */}
        {podeOperar && (
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-slate-800">
                Travar nova carreta
              </h2>
              <TravarForm />
            </div>
          </div>
        )}

        {/* Lista de carretas travadas */}
        <div className={podeOperar ? "lg:col-span-2" : "lg:col-span-3"}>
          {travadas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
              Nenhuma carreta travada no pátio.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {travadas.map((t) => (
                <div
                  key={t.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.fotoUrl}
                    alt={`Carreta ${t.placa}`}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-slate-800 px-2 py-1 font-mono text-sm font-bold tracking-wider text-white">
                        {t.placa}
                      </span>
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        TRAVADA
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 text-xs text-slate-500">
                      <div>
                        <span className="font-medium text-slate-600">Ticket:</span>{" "}
                        {t.ticket}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Travada em:
                        </span>{" "}
                        {t.travadoEm.toLocaleString("pt-BR")}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Por:</span>{" "}
                        {t.operador.nome}
                      </div>
                      {t.observacao && (
                        <div>
                          <span className="font-medium text-slate-600">Obs.:</span>{" "}
                          {t.observacao}
                        </div>
                      )}
                    </dl>
                    {podeOperar && (
                      <div className="mt-3">
                        <DestravarButton id={t.id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
