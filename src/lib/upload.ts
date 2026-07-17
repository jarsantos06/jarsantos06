import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Salva um arquivo enviado e retorna a URL pública (/uploads/...).
 * Abstrai o armazenamento: para migrar para S3/nuvem, basta trocar
 * a implementação desta função.
 *
 * @param subdir subpasta lógica (ex.: "carretas", "ocorrencias")
 */
export async function salvarUpload(
  file: File,
  subdir: string,
): Promise<{ url?: string; erro?: string }> {
  if (!file || file.size === 0) return { erro: "Arquivo não enviado." };
  if (!file.type.startsWith("image/")) {
    return { erro: "O anexo deve ser uma imagem." };
  }
  if (file.size > MAX_BYTES) {
    return { erro: "Imagem muito grande (máx. 8 MB)." };
  }

  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "jpg";
  const nome = `${randomUUID()}.${ext || "jpg"}`;
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, nome), bytes);

  return { url: `/uploads/${subdir}/${nome}` };
}
