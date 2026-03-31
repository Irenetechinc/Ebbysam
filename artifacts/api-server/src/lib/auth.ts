import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_USERNAME = "ebbysamadmin";
const ADMIN_PASSWORD = "ebby2200@saam1960?";
const SECRET =
  process.env.ADMIN_TOKEN_SECRET ?? "ebby-sam-admin-secret-2026";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function verifyCredentials(username: string, password: string): boolean {
  try {
    const uMatch = timingSafeEqual(
      Buffer.from(username),
      Buffer.from(ADMIN_USERNAME),
    );
    const pMatch = timingSafeEqual(
      Buffer.from(password),
      Buffer.from(ADMIN_PASSWORD),
    );
    return uMatch && pMatch;
  } catch {
    return false;
  }
}

export function createToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ user: ADMIN_USERNAME, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(sign(payload))))
      return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
