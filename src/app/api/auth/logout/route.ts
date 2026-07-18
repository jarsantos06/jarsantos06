import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

// Encerra a sessão e volta ao login.
// GET: usado quando requireUser detecta sessão inválida (cookie de um usuário
// que não existe mais / inativo) e precisa limpar o cookie fora do render.
// POST: botão "Sair" do portal (303 converte o redirect em GET).

async function encerrar(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", req.url), 303);
}

export async function GET(req: Request) {
  return encerrar(req);
}

export async function POST(req: Request) {
  return encerrar(req);
}
