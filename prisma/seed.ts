import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CARGOS_PADRAO } from "../src/lib/rbac";

const db = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10);

  // -------------------------------------------------------------------------
  // Cargos e permissões padrão (depois tudo é editável no módulo Cadastros).
  // As permissões do cargo são REPOSTAS a cada seed para refletir o padrão;
  // ajustes feitos na UI sobrevivem enquanto você não rodar o seed de novo.
  // -------------------------------------------------------------------------
  for (const c of CARGOS_PADRAO) {
    const cargo = await db.cargo.upsert({
      where: { nome: c.nome },
      update: { nivel: c.nivel, ativo: true },
      create: { nome: c.nome, nivel: c.nivel },
    });
    await db.cargoPermissao.deleteMany({ where: { cargoId: cargo.id } });
    await db.cargoPermissao.createMany({
      data: c.permissoes.map((p) => ({ cargoId: cargo.id, permissao: p })),
    });
  }

  const cargoPorNome = async (nome: string) => {
    const c = await db.cargo.findUnique({ where: { nome } });
    if (!c) throw new Error(`Cargo não encontrado no seed: ${nome}`);
    return c.id;
  };

  // Usuários de exemplo — um por faixa de cargo
  const usuarios: { matricula: string; nome: string; cargo: string }[] = [
    {
      matricula: "1001",
      nome: "Ana Assistente",
      cargo: "Assistente de Logística N1",
    },
    { matricula: "2001", nome: "Carlos Controlador", cargo: "Controlador" },
    { matricula: "3001", nome: "Eduardo Encarregado", cargo: "Encarregado N1" },
    { matricula: "4001", nome: "Sônia Supervisora", cargo: "Supervisor" },
    { matricula: "5001", nome: "Gustavo Gerente", cargo: "Gerente" },
  ];

  for (const u of usuarios) {
    const cargoId = await cargoPorNome(u.cargo);
    await db.user.upsert({
      where: { matricula: u.matricula },
      update: { nome: u.nome, cargoId, ativo: true },
      create: { matricula: u.matricula, nome: u.nome, cargoId, senhaHash },
    });
  }

  // Materiais iniciais do almoxarifado
  const materiais = [
    {
      codigo: "MAT-001",
      nome: "Papel A4 (resma)",
      categoria: "USO_DIARIO",
      unidade: "RESMA",
    },
    {
      codigo: "MAT-002",
      nome: "Caneta esferográfica azul",
      categoria: "USO_DIARIO",
      unidade: "UN",
    },
    {
      codigo: "LMP-001",
      nome: "Detergente 5L",
      categoria: "LIMPEZA",
      unidade: "GL",
    },
    {
      codigo: "LMP-002",
      nome: "Papel toalha (fardo)",
      categoria: "LIMPEZA",
      unidade: "FD",
    },
  ] as const;

  for (const m of materiais) {
    await db.material.upsert({
      where: { codigo: m.codigo },
      update: {},
      create: { ...m, saldo: 0, estoqueMinimo: 5 },
    });
  }

  // Padrões de escala
  const padroes = [
    { nome: "2x2", diasTrabalho: 2, diasFolga: 2 },
    { nome: "6x1", diasTrabalho: 6, diasFolga: 1 },
    { nome: "5x2", diasTrabalho: 5, diasFolga: 2 },
  ];
  for (const p of padroes) {
    await db.padraoEscala.upsert({
      where: { nome: p.nome },
      update: {},
      create: p,
    });
  }

  // Turnos
  const turnos = [
    { nome: "Diurno", horaInicio: "07:00", horaFim: "19:00" },
    { nome: "Noturno", horaInicio: "19:00", horaFim: "07:00" },
  ];
  for (const t of turnos) {
    await db.turno.upsert({
      where: { nome: t.nome },
      update: {},
      create: t,
    });
  }

  // Escala de exemplo para a Ana (2x2 diurno, a partir de 01/07/2026)
  const ana = await db.user.findUnique({ where: { matricula: "1001" } });
  const gerente = await db.user.findUnique({ where: { matricula: "5001" } });
  const padrao2x2 = await db.padraoEscala.findUnique({
    where: { nome: "2x2" },
  });
  const diurno = await db.turno.findUnique({ where: { nome: "Diurno" } });
  if (ana && gerente && padrao2x2 && diurno) {
    const jaTem = await db.escalaFuncionario.findFirst({
      where: { funcionarioId: ana.id },
    });
    if (!jaTem) {
      await db.escalaFuncionario.create({
        data: {
          funcionarioId: ana.id,
          padraoId: padrao2x2.id,
          turnoId: diurno.id,
          dataInicio: new Date(Date.UTC(2026, 6, 1)),
          dataFim: null,
          criadoPorId: gerente.id,
        },
      });
    }
  }

  console.log("✅ Seed concluído.");
  console.log(`   Cargos: ${CARGOS_PADRAO.map((c) => c.nome).join(", ")}`);
  console.log("   Usuários (senha para todos: 123456):");
  usuarios.forEach((u) =>
    console.log(`   - ${u.matricula} → ${u.nome} (${u.cargo})`),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
