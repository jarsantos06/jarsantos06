// Segredo da sessão (JWT), compartilhado por session.ts (server) e middleware (edge).
// Falha rápida em produção: em vez de cair silenciosamente para uma constante
// conhecida (o que permitiria forjar tokens), o app se recusa a subir sem um
// SESSION_SECRET forte configurado.

const raw = process.env.SESSION_SECRET;
const MIN_LEN = 32;

if (process.env.NODE_ENV === "production" && (!raw || raw.length < MIN_LEN)) {
  throw new Error(
    `SESSION_SECRET ausente ou muito curto (mínimo ${MIN_LEN} caracteres). ` +
      "Defina uma chave forte e secreta no ambiente de produção.",
  );
}

export const sessionSecret = new TextEncoder().encode(
  raw ??
    "dev-secret-inseguro-apenas-para-desenvolvimento-local-nao-use-em-producao",
);
