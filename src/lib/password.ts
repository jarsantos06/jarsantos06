import bcrypt from "bcryptjs";

export async function hashPassword(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function verifyPassword(
  senha: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
