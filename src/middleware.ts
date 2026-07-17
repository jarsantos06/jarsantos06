import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-inseguro",
);

// Rotas públicas (não exigem login)
const PUBLICAS = ["/login"];

async function temSessaoValida(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("sessao")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const logado = await temSessaoValida(req);

  // Já logado tentando abrir /login -> vai pro painel
  if (logado && PUBLICAS.includes(pathname)) {
    return NextResponse.redirect(new URL("/painel", req.url));
  }

  // Não logado tentando abrir rota protegida -> vai pro login
  if (!logado && !PUBLICAS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protege tudo, exceto assets estáticos, a API de auth e uploads públicos
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
