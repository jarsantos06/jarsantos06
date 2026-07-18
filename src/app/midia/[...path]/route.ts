import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/session";
import { UPLOAD_ROOT, TIPOS_IMAGEM } from "@/lib/upload";

// Entrega arquivos de upload de forma segura:
//  - exige sessão (evita acesso público a evidências sensíveis);
//  - impede path traversal (o caminho resolvido precisa estar sob UPLOAD_ROOT);
//  - só serve extensões de imagem conhecidas, com Content-Type fixo + nosniff.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const sessao = await getSession();
  if (!sessao) {
    return new Response("Não autorizado", { status: 401 });
  }

  const { path: segmentos } = await params;
  const rel = path.join(...segmentos);
  const base = path.resolve(UPLOAD_ROOT);
  const resolvido = path.resolve(base, rel);

  // Barreira contra path traversal (../)
  if (resolvido !== base && !resolvido.startsWith(base + path.sep)) {
    return new Response("Caminho inválido", { status: 400 });
  }

  const ext = path.extname(resolvido).slice(1).toLowerCase();
  const contentType = TIPOS_IMAGEM[ext];
  if (!contentType) {
    return new Response("Tipo não suportado", { status: 415 });
  }

  try {
    const arquivo = await readFile(resolvido);
    return new Response(new Uint8Array(arquivo), {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Arquivo não encontrado", { status: 404 });
  }
}
