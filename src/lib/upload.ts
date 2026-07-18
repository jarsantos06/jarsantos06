import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

// Uploads ficam FORA de public/ (não são servidos como assets estáticos).
// São entregues pela rota autenticada /midia/[...path], que aplica
// Content-Type seguro + nosniff. Isso evita:
//  - XSS armazenado (um .html/.svg com script servido na origem do app);
//  - acesso não autenticado a evidências potencialmente sensíveis.
export const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Tipos de imagem aceitos, detectados por MAGIC BYTES (não pelo Content-Type
// nem pela extensão enviada — ambos são controlados pelo cliente).
export const TIPOS_IMAGEM: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

function detectarImagem(buf: Buffer): keyof typeof TIPOS_IMAGEM | null {
  if (buf.length < 12) return null;
  // PNG: 89 50 4E 47
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  // WEBP: "RIFF"...."WEBP"
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  // GIF: "GIF8"
  if (buf.toString("ascii", 0, 4) === "GIF8") return "gif";
  return null; // rejeita svg, html, pdf, etc.
}

/**
 * Salva um upload de imagem validado por conteúdo real e retorna a URL
 * (servida pela rota autenticada /midia/...).
 *
 * @param subdir subpasta lógica (ex.: "carretas", "ocorrencias")
 */
export async function salvarUpload(
  file: File,
  subdir: "carretas" | "ocorrencias",
): Promise<{ url?: string; erro?: string }> {
  if (!file || file.size === 0) return { erro: "Arquivo não enviado." };
  if (file.size > MAX_BYTES) {
    return { erro: "Imagem muito grande (máx. 8 MB)." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const tipo = detectarImagem(bytes);
  if (!tipo) {
    return { erro: "O anexo deve ser uma imagem (PNG, JPG, WEBP ou GIF)." };
  }

  const nome = `${randomUUID()}.${tipo}`; // extensão forçada pelo tipo detectado
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nome), bytes);

  return { url: `/midia/${subdir}/${nome}` };
}
