import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { tempoDecorrido } from "@/lib/date";
import {
  PageHeader,
  Card,
  Badge,
  EmptyState,
  btn,
  Input,
} from "@/components/ui";
import { TravarForm } from "./TravarForm";
import { DestravarButton } from "./DestravarButton";

export default async function CarretaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sessao = await requirePermission("carreta.ver");
  const podeOperar = can(sessao.permissoes, "carreta.operar");
  const { q } = await searchParams;
  const busca = (q ?? "").trim().toUpperCase();

  const travadas = await db.travamento.findMany({
    where: {
      status: "TRAVADA",
      ...(busca ? { placa: { contains: busca } } : {}),
    },
    orderBy: { travadoEm: "desc" },
    include: { operador: { select: { nome: true } } },
  });

  const agora = new Date();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        voltarHref="/painel"
        voltarLabel="Painel"
        titulo="🚛 Travamento de Carreta"
        subtitulo={`${travadas.length} carreta(s)${busca ? ` para “${busca}”` : " travada(s) no pátio"}`}
        acoes={
          <Link
            href="/painel/carreta/historico"
            className={btn("secondary", "sm")}
          >
            🕑 Histórico
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário de travamento */}
        {podeOperar && (
          <div className="lg:col-span-1">
            <Card className="p-5">
              <h2 className="mb-4 font-semibold text-slate-800">
                Travar nova carreta
              </h2>
              <TravarForm />
            </Card>
          </div>
        )}

        {/* Lista de carretas travadas */}
        <div className={podeOperar ? "lg:col-span-2" : "lg:col-span-3"}>
          {/* Busca por placa */}
          <form method="get" className="mb-4 flex gap-2">
            <Input
              name="q"
              defaultValue={busca}
              placeholder="Buscar por placa..."
              className="uppercase"
            />
            <button type="submit" className={btn("secondary")}>
              Buscar
            </button>
            {busca && (
              <Link href="/painel/carreta" className={btn("ghost")}>
                Limpar
              </Link>
            )}
          </form>

          {travadas.length === 0 ? (
            <EmptyState
              emoji="🅿️"
              titulo={
                busca
                  ? "Nenhuma carreta encontrada"
                  : "Nenhuma carreta travada no pátio"
              }
              descricao={
                busca
                  ? "Tente outra placa ou limpe a busca."
                  : "As carretas travadas aparecem aqui."
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {travadas.map((t) => (
                <Card key={t.id} className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.fotoUrl}
                    alt={`Carreta ${t.placa}`}
                    className="h-44 w-full bg-slate-100 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-slate-800 px-2 py-1 font-mono text-sm font-bold tracking-wider text-white">
                        {t.placa}
                      </span>
                      <Badge tone="red">TRAVADA</Badge>
                    </div>
                    <dl className="mt-3 space-y-1 text-xs text-slate-500">
                      <div>
                        <span className="font-medium text-slate-600">
                          Ticket:
                        </span>{" "}
                        {t.ticket}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          No pátio:
                        </span>{" "}
                        {tempoDecorrido(t.travadoEm, agora)}
                        <span className="text-slate-400">
                          {" "}
                          · {t.travadoEm.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Por:</span>{" "}
                        {t.operador.nome}
                      </div>
                      {t.observacao && (
                        <div>
                          <span className="font-medium text-slate-600">
                            Obs.:
                          </span>{" "}
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
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
