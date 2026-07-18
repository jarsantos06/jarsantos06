import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { can, roleLabel } from "@/lib/rbac";
import { db } from "@/lib/db";
import { MODULOS } from "@/lib/navigation";
import { atribuicaoDoDia, trabalhaNoDia } from "@/lib/escala";
import { carregarAtribuicoes } from "./escala/data";
import { StatCard, Alert } from "@/components/ui";

export default async function PainelHome({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await requireUser();
  const { erro } = await searchParams;
  const modulos = MODULOS.filter((m) => can(user.role, m.permissao));

  const podeAlmox = can(user.role, "almoxarifado.ver");
  const podeCarreta = can(user.role, "carreta.ver");
  const podeAprovar = can(user.role, "ocorrencia.aprovar");
  const podeEscala = can(user.role, "escala.ver");

  const agora = new Date();
  const hojeUTC = new Date(
    Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()),
  );

  const [
    materiais,
    carretasPatio,
    aprovarPendentes,
    minhasPendentes,
    atribUser,
  ] = await Promise.all([
    podeAlmox
      ? db.material.findMany({
          where: { ativo: true },
          select: { saldo: true, estoqueMinimo: true },
        })
      : Promise.resolve(null),
    podeCarreta
      ? db.travamento.count({ where: { status: "TRAVADA" } })
      : Promise.resolve(null),
    podeAprovar
      ? db.ocorrencia.count({
          where: { status: "PENDENTE", NOT: { solicitanteId: user.userId } },
        })
      : Promise.resolve(null),
    db.ocorrencia.count({
      where: { solicitanteId: user.userId, status: "PENDENTE" },
    }),
    podeEscala ? carregarAtribuicoes(user.userId) : Promise.resolve(null),
  ]);

  const estoqueBaixo = materiais?.filter(
    (m) => m.saldo <= m.estoqueMinimo,
  ).length;

  // Minha escala hoje
  let escalaHoje: { trabalha: boolean; turno?: string } | null = null;
  if (atribUser) {
    const a = atribuicaoDoDia(atribUser, hojeUTC);
    if (a) {
      const trabalha = trabalhaNoDia(
        a.dataInicio,
        a.diasTrabalho,
        a.diasFolga,
        hojeUTC,
      );
      escalaHoje = {
        trabalha,
        turno: trabalha
          ? `${a.turnoNome} ${a.turnoInicio}–${a.turnoFim}`
          : undefined,
      };
    }
  }

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
        <div className="mb-6">
          <Alert tone="warning">
            Você não tem permissão para acessar esse módulo.
          </Alert>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {estoqueBaixo !== undefined && (
          <StatCard
            label="Estoque baixo"
            valor={estoqueBaixo}
            emoji="📦"
            tone={estoqueBaixo > 0 ? "red" : "green"}
            href="/painel/almoxarifado"
            hint="materiais no mínimo"
          />
        )}
        {carretasPatio !== null && (
          <StatCard
            label="Carretas no pátio"
            valor={carretasPatio}
            emoji="🚛"
            tone="brand"
            href="/painel/carreta"
            hint="travadas agora"
          />
        )}
        {aprovarPendentes !== null && (
          <StatCard
            label="A aprovar"
            valor={aprovarPendentes}
            emoji="📝"
            tone={aprovarPendentes > 0 ? "amber" : "slate"}
            href="/painel/ocorrencias/aprovacoes"
            hint="ocorrências pendentes"
          />
        )}
        {escalaHoje && (
          <StatCard
            label="Minha escala hoje"
            valor={escalaHoje.trabalha ? "Trabalha" : "Folga"}
            emoji="📅"
            tone={escalaHoje.trabalha ? "green" : "slate"}
            href="/painel/escala"
            hint={escalaHoje.turno ?? "aproveite o descanso"}
          />
        )}
        {minhasPendentes > 0 && (
          <StatCard
            label="Minhas ocorrências"
            valor={minhasPendentes}
            emoji="⏳"
            tone="amber"
            href="/painel/ocorrencias"
            hint="aguardando aprovação"
          />
        )}
      </div>

      {/* Módulos */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Módulos
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <Link
            key={m.chave}
            href={m.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="mb-3 text-3xl">{m.emoji}</div>
            <h3 className="font-semibold text-slate-800 group-hover:text-brand-700">
              {m.titulo}
            </h3>
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
