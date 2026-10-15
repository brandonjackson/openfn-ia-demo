/** Personal access tokens and MFA backup codes. Types only: no data, no behaviour. */

export interface ApiToken {
  id: string;
  /** Full token; only its last 10 characters are ever shown in the table. */
  token: string;
  insertedAt: string;
  lastUsedAt: string | null;
}

export interface BackupCode {
  code: string;
  usedAt: string | null;
}
