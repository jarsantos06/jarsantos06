# Guia de Contribuição

Obrigado por contribuir com o **AppValenLog**. Este guia resume o fluxo de trabalho e as convenções do projeto.

## Ambiente

Pré-requisitos: **Node.js 22+** (veja `.nvmrc`).

```bash
npm install
cp .env.example .env
npm run db:push
npm run seed
npm run dev
```

## Fluxo de trabalho

1. Crie uma branch a partir da `main`:
   - `feat/nome-do-recurso` — nova funcionalidade
   - `fix/descricao-do-bug` — correção
   - `chore/tarefa` — manutenção
2. Faça commits pequenos e descritivos (veja convenção abaixo).
3. Garanta que a verificação local passa (`lint`, `typecheck`, `build`).
4. Abra um Pull Request para a `main` preenchendo o template.

## Convenção de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(escopo opcional): descrição no imperativo

corpo opcional
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `ci`, `perf`.

Exemplos:

- `feat(almoxarifado): adiciona filtro por categoria`
- `fix(escala): corrige off-by-one de fuso no cálculo`
- `docs: atualiza instruções de setup`

## Verificação antes do PR

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript (tsc --noEmit)
npm run build       # build de produção
npm run format      # formata com Prettier
```

## Padrões de código

- **Server Components por padrão**; use `"use client"` só quando precisar de interatividade.
- Toda rota/ação protegida deve chamar `requireUser()` ou `requirePermission()`.
- Regras de "quem pode o quê" vivem em `src/lib/rbac.ts` — não espalhe checagens ad-hoc.
- Valide entradas com **Zod** nas server actions.
- Datas civis (sem horário) passam por `src/lib/date.ts` (ancoradas em UTC).

## Adicionando um novo módulo

Veja a seção "Adicionando um novo módulo" no [README](./README.md).
