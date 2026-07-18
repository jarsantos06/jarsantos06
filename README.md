# AppValenLog — Sistema Operacional

[![CI](https://github.com/jarsantos06/appvalenlog/actions/workflows/ci.yml/badge.svg)](https://github.com/jarsantos06/appvalenlog/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Licença](https://img.shields.io/badge/licença-proprietária-red)

Portal de gestão operacional (logística/pátio) **modular**, com controle de acesso por papéis. Cada módulo é desenvolvido de forma isolada e controlada sobre uma base compartilhada de autenticação, permissões e navegação.

## ✨ Módulos

| Módulo                       | O que faz                                                                            | Opera                                | Audita / Aprova                     |
| ---------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------- |
| 📦 **Almoxarifado**          | Entrada/saída de materiais (uso diário e limpeza) com bloqueio de saldo negativo     | Controlador, Encarregado, Supervisor | Cadastro e auditoria: só Supervisor |
| 🚛 **Travamento de Carreta** | Trava/destrava carretas no pátio com placa, foto, ticket e data/hora automáticos     | Controlador, Encarregado             | —                                   |
| 📝 **Ocorrências**           | Ficha de falta/atraso com evidência e fluxo de aprovação                             | Todos os funcionários                | Aprovam: Supervisor e Gerente       |
| 📅 **Escala / Turnos**       | Escalas por padrão (2x2, 6x1, 5x2) e turno, com cálculo automático de trabalha/folga | Funcionário vê a própria             | Monta/edita: Supervisor e Gerente   |

## 🧱 Stack

- **[Next.js 16](https://nextjs.org/)** (App Router) + **TypeScript**
- **[Prisma](https://www.prisma.io/)** ORM — **SQLite** em dev, pronto para **PostgreSQL** em produção
- **[Tailwind CSS](https://tailwindcss.com/)**
- Autenticação por sessão (JWT em cookie `httpOnly`) + middleware
- RBAC centralizado (`src/lib/rbac.ts`)

## 👥 Papéis de acesso

`Funcionário` · `Controlador` · `Encarregado` · `Supervisor` · `Gerente`

## 🚀 Começando

Pré-requisitos: **Node.js 22+**.

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env        # ajuste SESSION_SECRET

# 3. Crie o banco e popule dados de exemplo
npm run db:push
npm run seed

# 4. Suba o servidor de desenvolvimento
npm run dev                 # http://localhost:3000
```

### Usuários de exemplo (senha `123456`)

| Matrícula | Nome                | Papel       |
| --------- | ------------------- | ----------- |
| `1001`    | Ana Funcionária     | Funcionário |
| `2001`    | Carlos Controlador  | Controlador |
| `3001`    | Eduardo Encarregado | Encarregado |
| `4001`    | Sônia Supervisora   | Supervisor  |
| `5001`    | Gustavo Gerente     | Gerente     |

## 📜 Scripts

| Comando             | Descrição                       |
| ------------------- | ------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento     |
| `npm run build`     | Build de produção               |
| `npm start`         | Sobe o build de produção        |
| `npm run lint`      | Verifica o código com ESLint    |
| `npm run format`    | Formata o código com Prettier   |
| `npm run typecheck` | Checagem de tipos (sem emitir)  |
| `npm run db:push`   | Sincroniza o schema com o banco |
| `npm run seed`      | Popula dados de exemplo         |
| `npm run db:studio` | Abre o Prisma Studio            |

## 🗂️ Estrutura

```
src/
├── app/
│   ├── login/                 # autenticação
│   ├── api/auth/logout/       # encerrar sessão
│   └── painel/                # portal (protegido por middleware)
│       ├── almoxarifado/      # Módulo 1
│       ├── carreta/           # Módulo 2
│       ├── ocorrencias/       # Módulo 3
│       └── escala/            # Módulo 4
├── lib/
│   ├── db.ts                  # cliente Prisma (singleton)
│   ├── rbac.ts                # papéis e permissões (regra central)
│   ├── auth.ts                # requireUser / requirePermission
│   ├── session.ts             # sessão JWT
│   ├── navigation.ts          # registro de módulos do portal
│   ├── upload.ts              # armazenamento de imagens (abstraído)
│   └── escala.ts              # cálculo de escala (funções puras)
└── middleware.ts              # proteção de rotas
prisma/
├── schema.prisma              # modelo de dados
└── seed.ts                    # dados iniciais
```

## ➕ Adicionando um novo módulo

1. Modele os dados em `prisma/schema.prisma` e rode `npm run db:push`
2. Declare as permissões em `src/lib/rbac.ts` (`Permission` + matriz `PERMISSOES`)
3. Registre o módulo em `src/lib/navigation.ts` (aparece no portal só para quem tem a permissão)
4. Crie as páginas em `src/app/painel/<modulo>/`, protegendo com `requirePermission(...)`

## 🔒 Produção

- Trocar o `provider` do Prisma para `postgresql` e ajustar `DATABASE_URL`
- Definir um `SESSION_SECRET` forte e secreto
- Substituir o armazenamento local de `src/lib/upload.ts` por um bucket (S3/nuvem)

## 📄 Licença

Software **proprietário** — todos os direitos reservados. Veja [LICENSE](./LICENSE).
