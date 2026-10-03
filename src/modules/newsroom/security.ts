import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const params = { N: 16384, r: 8, p: 1 };
const scrypt = (password: string, salt: string) => new Promise<Buffer>((resolve, reject) => scryptCallback(password, salt, 64, params, (error, key) => error ? reject(error) : resolve(key)));

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 1024) throw new Error("Password must be 12–1024 characters");
  const salt = randomBytes(24).toString("hex");
  const key = await scrypt(password, salt);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [kind, salt, hash] = encoded.split("$");
  if (kind !== "scrypt" || !salt || !hash || !/^[0-9a-f]{128}$/.test(hash)) return false;
  const candidate = await scrypt(password, salt);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export function newSessionToken(): string { return randomBytes(32).toString("base64url"); }
export function tokenDigest(token: string): string { return createHash("sha256").update(token).digest("hex"); }

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const submitted = new URL(origin);
    const target = new URL(request.url);
    const host = request.headers.get("host") ?? target.host;
    const protocol = request.headers.get("x-forwarded-proto") ?? target.protocol.replace(":", "");
    return submitted.host === host && submitted.protocol === `${protocol}:`;
  } catch { return false; }
}
