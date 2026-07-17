# Sistema Operacional

Portal de gestão operacional modular (logística/pátio) com controle de acesso por papéis.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Prisma** ORM + **SQLite** (dev) — migração para PostgreSQL é direta
- **Tailwind CSS**
- Autenticação por sessão (JWT em cookie httpOnly) + middleware
- RBAC centralizado (`src/lib/rbac.ts`)

## Papéis de acesso

`Funcionário` · `Controlador` · `Encarregado` · `Supervisor` · `Gerente`

## Módulos

| Módulo | O que faz | Quem opera | Quem audita/aprova |
|---|---|---|---|
| **📦 Almoxarifado** | Entrada/saída de materiais (uso diário e limpeza), com bloqueio de saldo negativo | Controlador, Encarregado, Supervisor | Auditoria: só Supervisor. Cadastro de material: só Supervisor |
| **🚛 Travamento de Carreta** | Trava/destrava carretas no pátio com placa, foto, ticket e data/hora automáticos | Controlador, Encarregado | — |
| **📝 Ocorrências** | Ficha de falta/atraso com evidência e fluxo de aprovação | Todos os funcionários criam | Aprovam: Supervisor e Gerente |

## Como rodar (desenvolvimento)

```bash
npm install
cp .env.example .env          # ajuste SESSION_SECRET
npm run db:push               # cria o banco SQLite a partir do schema
npm run seed                  # popula usuários e materiais de teste
npm run dev                   # http://localhost:3000
```

### Usuários de teste (senha `123456`)

| Matrícula | Nome | Papel |
|---|---|---|
| 1001 | Ana Funcionária | Funcionário |
| 2001 | Carlos Controlador | Controlador |
| 3001 | Eduardo Encarregado | Encarregado |
| 4001 | Sônia Supervisora | Supervisor |
| 5001 | Gustavo Gerente | Gerente |

## Estrutura

```
src/
├── app/
│   ├── login/                 # autenticação
│   ├── api/auth/logout/       # encerrar sessão
│   └── painel/                # portal (protegido)
│       ├── almoxarifado/      # Módulo 1
│       ├── carreta/           # Módulo 2
│       └── ocorrencias/       # Módulo 3
├── lib/
│   ├── db.ts                  # cliente Prisma
│   ├── rbac.ts                # papéis e permissões (regra central)
│   ├── auth.ts                # requireUser / requirePermission
│   ├── session.ts             # sessão JWT
│   ├── navigation.ts          # registro de módulos do portal
│   └── upload.ts              # armazenamento de imagens (abstraído)
└── middleware.ts              # proteção de rotas
prisma/
├── schema.prisma             # modelo de dados
└── seed.ts                   # dados iniciais
```

## Como adicionar um novo módulo

1. Adicione os modelos ao `prisma/schema.prisma` e rode `npm run db:push`
2. Declare as permissões em `src/lib/rbac.ts` (tipo `Permission` + matriz `PERMISSOES`)
3. Registre o módulo em `src/lib/navigation.ts` (aparece no portal só para quem tem a permissão)
4. Crie as páginas em `src/app/painel/<modulo>/`, protegendo com `requirePermission(...)`

## Produção (notas)

- Trocar `provider` do Prisma para `postgresql` e ajustar `DATABASE_URL`
- Definir um `SESSION_SECRET` forte e secreto
- Substituir o armazenamento local de `src/lib/upload.ts` por um bucket (S3/nuvem)
