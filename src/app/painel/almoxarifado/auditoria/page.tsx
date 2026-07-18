import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AuditoriaPage() {
  await requirePermission("almoxarifado.auditar");

  const [movimentacoes, entradas, saidas] = await Promise.all([
    db.movimentacaoMaterial.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        material: { select: { nome: true, unidade: true, codigo: true } },
        usuario: { select: { nome: true } },
      },
    }),
    db.movimentacaoMaterial.count({ where: { tipo: "ENTRADA" } }),
    db.movimentacaoMaterial.count({ where: { tipo: "SAIDA" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/painel/almoxarifado"
        className="text-sm text-brand-600 hover:underline"
      >
        ← Almoxarifado
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold text-slate-800">
        📊 Auditoria de movimentações
      </h1>
      <p className="mb-6 text-slate-500">
        Trilha completa — visível apenas para o Supervisor.
      </p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card titulo="Total de registros" valor={movimentacoes.length} />
        <Card titulo="Entradas" valor={entradas} cor="text-green-700" />
        <Card titulo="Saídas" valor={saidas} cor="text-red-600" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Data/Hora</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 text-right font-medium">Qtd.</th>
              <th className="px-4 py-3 text-right font-medium">Saldo após</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
              <th className="px-4 py-3 font-medium">Destino/Origem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimentacoes.map((mv) => (
              <tr key={mv.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                  {mv.createdAt.toLocaleDateString("pt-BR")}{" "}
                  {mv.createdAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-slate-800">
                  {mv.material.nome}
                  <span className="ml-1 font-mono text-xs text-slate-400">
                    {mv.material.codigo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      mv.tipo === "ENTRADA"
                        ? "rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                    }
                  >
                    {mv.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {mv.quantidade} {mv.material.unidade}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {mv.saldoApos}
                </td>
                <td className="px-4 py-3 text-slate-600">{mv.usuario.nome}</td>
                <td className="px-4 py-3 text-slate-500">
                  {mv.destino ?? "—"}
                </td>
              </tr>
            ))}
            {movimentacoes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhuma movimentação registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({
  titulo,
  valor,
  cor = "text-slate-800",
}: {
  titulo: string;
  valor: number;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`text-3xl font-bold ${cor}`}>{valor}</p>
    </div>
  );
}
