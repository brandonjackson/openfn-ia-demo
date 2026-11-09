/*
 * A project's environment variables, as the demo's own routes have them
 * (`/api/demo/projects/:id/env_vars`), and the rules the form checks before
 * sending: pure functions over what's typed. The server still has the last
 * word.
 */
import type { Environment } from "./credentials";
import { ENVIRONMENTS, environmentLabels } from "./credentials";

/** One variable: a key and its value in the environments it's set for. */
export interface EnvVar {
  id: string;
  /** e.g. "DHIS2_BASE_URL". Unique in each environment it's set for. */
  key: string;
  /** Its value; null for a secret, which is never sent back once saved. */
  value: string | null;
  /** Hidden once saved: it can be replaced but not read, and can't be made plain again. */
  secret: boolean;
  /** Where it's set; at least one. The same key can hold another value in other environments. */
  environments: Environment[];
  /** When it last changed, in words ("3 days ago"). */
  updatedAt: string;
  updatedBy: string;
}

/** What the form sends to make or change one. */
export interface EnvVarDraft {
  key: string;
  /** On a change to a secret, blank keeps the stored value. */
  value: string;
  secret: boolean;
  environments: Environment[];
}

/** Environments in a sentence: "production", "staging and mock", "production, staging and mock". */
export function listEnvironments(envs: Environment[]): string {
  const words = ENVIRONMENTS.filter((e) => envs.includes(e)).map((e) => environmentLabels[e].toLowerCase());
  return words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** Every environment, the default for a new variable. */
export const allEnvironments: Environment[] = [...ENVIRONMENTS];

const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** What's wrong with a key, in the form's words, or undefined. */
export function envVarKeyError(key: string): string | undefined {
  const k = key.trim();
  if (!k) return "Enter a key";
  if (!KEY.test(k)) return "Use letters, digits and underscores, not starting with a digit";
  return undefined;
}

/**
 * The environments, of those picked, where another variable already sets
 * this key (keys match case and all, as a process's environment does).
 */
export function takenEnvironments(vars: EnvVar[], key: string, environments: Environment[], exceptId?: string): Environment[] {
  const k = key.trim();
  return environments.filter((env) => vars.some((v) => v.id !== exceptId && v.key === k && v.environments.includes(env)));
}

/**
 * Reads a pasted `.env` file into keys and values: one `KEY=value` a line,
 * with blank lines and `#` comments skipped, an `export ` before the key
 * dropped, and one pair of matching quotes around a value taken off.
 */
export function parseEnvFile(text: string): { key: string; value: string }[] {
  return text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return [];
    const eq = trimmed.indexOf("=");
    if (eq < 1) return [];
    const key = trimmed.slice(0, eq).replace(/^export\s+/, "").trim();
    let value = trimmed.slice(eq + 1).trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.length > 1 && value.endsWith(quote)) value = value.slice(1, -1);
    return key ? [{ key, value }] : [];
  });
}

/** Whether pasted text reads as `.env` lines rather than a single key. */
export const looksLikeEnvFile = (text: string) => parseEnvFile(text).length > 0;
