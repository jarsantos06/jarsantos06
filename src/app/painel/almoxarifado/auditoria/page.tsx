import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card, Badge, StatCard } from "@/components/ui";

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
      <PageHeader
        voltarHref="/painel/almoxarifado"
        voltarLabel="Almoxarifado"
        titulo="📊 Auditoria de movimentações"
        subtitulo="Trilha completa — visível apenas para o Supervisor"
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Exibindo"
          valor={movimentacoes.length}
          hint="últimos registros"
        />
        <StatCard label="Entradas (total)" valor={entradas} tone="green" />
        <StatCard label="Saídas (total)" valor={saidas} tone="red" />
      </div>

      <Card className="overflow-x-auto">
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
                  <Badge tone={mv.tipo === "ENTRADA" ? "green" : "red"}>
                    {mv.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                  </Badge>
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
      </Card>
    </div>
  );
}
