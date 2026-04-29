import { timingSafeEqual } from "node:crypto";

/**
 * Parses SIGNUP_INVITE_CODES (comma-separated, server-only).
 */
export function parseSignupInviteCodesFromEnv(): string[] {
  const raw = process.env.SIGNUP_INVITE_CODES?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function isAllowedSignupInviteCode(
  input: string,
  allowed: string[],
): boolean {
  const candidate = input.trim();
  if (!candidate || allowed.length === 0) return false;
  for (const secret of allowed) {
    if (candidate.length !== secret.length) continue;
    try {
      if (
        timingSafeEqual(
          Buffer.from(candidate, "utf8"),
          Buffer.from(secret, "utf8"),
        )
      ) {
        return true;
      }
    } catch {
      /* mismatched lengths should not reach here */
    }
  }
  return false;
}
