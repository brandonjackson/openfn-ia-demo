/** Personal access tokens and MFA backup codes. Types only: no data, no behaviour. */

export interface ApiToken {
  id: string;
  /** "..." plus the token's last 10 characters (Lightning's `mask_token`). The server never sends a stored token's secret. */
  masked: string;
  insertedAt: string;
  lastUsedAt: string | null;
}

export interface BackupCode {
  code: string;
  usedAt: string | null;
}
