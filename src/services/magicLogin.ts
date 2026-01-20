import crypto from "crypto";

export function generateMagicToken(): string {
  // URL-safe token
  return crypto.randomBytes(32).toString("base64url");
}

export function hashMagicToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

