/**
 * Personal access tokens and MFA backup codes for the signed-in user
 * (/profile/tokens, /profile/auth/backup_codes). Static fixtures only:
 * every value is an obviously fake placeholder, never a real secret.
 */

export interface ApiToken {
  id: string;
  /** Full token; only its last 10 characters are ever shown in the table. */
  token: string;
  insertedAt: string;
  lastUsedAt: string | null;
}

export const apiTokens: ApiToken[] = [
  {
    id: "token-1",
    token: "demo.fake-token-not-real.AbCdE-12345",
    insertedAt: "2026-10-14T08:12:00Z",
    lastUsedAt: null,
  },
  {
    id: "token-2",
    token: "demo.fake-token-not-real.ZyXwV-67890",
    insertedAt: "2026-09-02T14:30:00Z",
    lastUsedAt: "2026-10-12T16:05:00Z",
  },
];

/** Lightning's `mask_token`: "..." plus the last 10 characters. */
export function maskToken(token: ApiToken): string {
  return "..." + token.token.slice(-10);
}

/** A new fake token, shown once after "Generate New Token". */
export function generateFakeToken(): ApiToken {
  const suffix = Math.random().toString(36).slice(2, 12).padEnd(10, "x");
  return {
    id: `token-${Date.now()}`,
    token: `demo.fake-token-not-real.${suffix}`,
    insertedAt: new Date().toISOString(),
    lastUsedAt: null,
  };
}

export interface BackupCode {
  code: string;
  usedAt: string | null;
}

/** Ten placeholder recovery codes; one already used. */
export const backupCodes: BackupCode[] = [
  "demo0001", "demo0002", "demo0003", "demo0004", "demo0005",
  "demo0006", "demo0007", "demo0008", "demo0009", "demo0010",
].map((code, i) => ({ code, usedAt: i === 2 ? "2026-09-18T10:41:07Z" : null }));

export function regenerateFakeBackupCodes(): BackupCode[] {
  return Array.from({ length: 10 }, () => ({
    code: "demo" + Math.random().toString(36).slice(2, 6),
    usedAt: null,
  }));
}
