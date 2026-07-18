# Política de Segurança

## Relatando uma vulnerabilidade

Se você encontrar uma vulnerabilidade de segurança, **não abra uma issue pública**.
Em vez disso, reporte de forma privada ao responsável pelo repositório (via
"Security advisories" do GitHub ou contato direto com o mantenedor).

Inclua, se possível:

- Descrição da vulnerabilidade e do impacto
- Passos para reproduzir
- Módulo/arquivo afetado

## Boas práticas adotadas

- Sessão em cookie `httpOnly` + `sameSite=lax`, JWT assinado (HS256)
- `SESSION_SECRET` obrigatório em produção (o app não sobe sem um segredo forte)
- Senhas com hash **bcrypt**
- Autorização por papéis (RBAC) reforçada em **todas** as server actions
- Uploads validados por _magic bytes_ e servidos por rota autenticada
- Segredos fora do versionamento (`.env` no `.gitignore`)

## Recomendações para produção

- Definir `SESSION_SECRET` forte (≥ 32 caracteres, aleatório)
- Migrar o banco para PostgreSQL e restringir acesso
- Servir a aplicação sob HTTPS
- Configurar rate limiting/lockout no login
- Forçar troca da senha inicial dos usuários
