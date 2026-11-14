import { FlaskConical, Lock, type LucideIcon } from "lucide-react";
import { ENVIRONMENTS, type Environment } from "./credentials";
import type { WorkflowChange } from "./workflow-changes";

/** How a sandbox's name becomes its slug: lower case, words joined by hyphens. */
export function sandboxSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Why a sandbox can't be called `name`, or nothing when it can. `taken` are the names in use. */
export function sandboxNameError(name: string, taken: string[]): string | undefined {
  const slug = sandboxSlug(name);
  if (!slug) return "Give the sandbox a name.";
  if (slug === "main") return "Main is the project's own line; pick another name.";
  if (taken.includes(slug)) return `There's already a sandbox called ${slug}.`;
  return undefined;
}

/**
 * The icon that marks a sandbox wherever it's named: main is read-only, so it
 * carries a lock, as it does in the editor; every other sandbox the beaker.
 */
export function sandboxIcon(isMain: boolean): LucideIcon {
  return isMain ? Lock : FlaskConical;
}

/** A sandbox as the Sandboxes page lists it, main included. */
export interface SandboxItem {
  /** Its slug, e.g. "intake-validation-v2", which is how it's named everywhere. */
  name: string;
  /** The project's main line, which every other sandbox promotes back into. */
  isMain: boolean;
  createdBy: string;
  /** When it last changed (or, if nothing has, when it was made), as the API sends it; null if unknown. The page words it. */
  lastActivity: string | null;
  /** The environment its runs load credentials from, e.g. "staging". */
  env: string;
  /** The sandbox it was made from, and promotes into. Main has none. */
  parent?: string;
  /**
   * What promoting it would bring into its parent, one line each, as the
   * sandbox chip lists them: its new and changed workflows, components and
   * environment variables.
   */
  changes: WorkflowChange[];
}

/** What making a sandbox, or editing one, asks for. */
export interface SandboxDraft {
  /** As typed; the sandbox is named its slug. */
  name: string;
  /** The environment its runs load credentials from. */
  env: Environment;
  /** The sandbox to make it from. Only when making one. */
  parent?: string;
  /** A reviewed copy of a loaded run's input, saved in the new sandbox. Only from "Edit in sandbox" with a run loaded. */
  runInput?: { runId: string; body: string };
}

/** The environment a new sandbox runs in unless another is picked. */
export const DEFAULT_SANDBOX_ENV: Environment = "staging";

/** A stored environment as one the forms offer; staging when it's none of them (main's "main", say). */
export function sandboxEnvironment(env: string | null | undefined): Environment {
  return (ENVIRONMENTS as string[]).includes(env ?? "") ? (env as Environment) : DEFAULT_SANDBOX_ENV;
}

/**
 * The names a sandbox picker lists for a project: "main" first, then each
 * sandbox in the tree that isn't scheduled for deletion, once. Names are
 * unique only among a parent's own sandboxes, so a sandbox of a sandbox can
 * share a name with one elsewhere in the tree (or one brought back from
 * deletion); the picker selects by name, so it lists each name once.
 */
export function sandboxNames(sandboxes: { name: string; scheduledDeletion?: unknown }[]): string[] {
  return [...new Set(["main", ...sandboxes.filter((s) => !s.scheduledDeletion).map((s) => s.name)])];
}
