import { FlaskConical, Lock, type LucideIcon } from "lucide-react";

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

/** A sandbox's colour as Lightning stores it (hex), by the name the demo's swatches use. */
export const sandboxColorHex: Record<SandboxColor, string> = {
  indigo: "#6366f1",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  pink: "#ec4899",
  gray: "#6b7280",
};

/** The swatch for a stored colour; gray when it has none, or one the swatches don't have. */
export function sandboxColorName(hex: string | null | undefined): SandboxColor {
  const found = (Object.entries(sandboxColorHex) as [SandboxColor, string][]).find(([, h]) => h.toLowerCase() === hex?.toLowerCase());
  return found?.[0] ?? "gray";
}

/** The colours a sandbox can be marked with, so you can tell at a glance which one you're in. */
export type SandboxColor = "indigo" | "green" | "yellow" | "red" | "pink" | "gray";

export const SANDBOX_COLORS: SandboxColor[] = ["indigo", "green", "yellow", "red", "pink", "gray"];

/** A workflow changed in a sandbox, which merging would bring into its target. */
export interface SandboxChange {
  workflowId: string;
  workflowName: string;
  /** The target has changed this workflow too since the sandbox was made, so merging overwrites those changes. */
  diverged: boolean;
}

export interface SandboxItem {
  /** Its slug, e.g. "intake-validation-v2", which is how it's named everywhere. */
  name: string;
  /** The project's main line, which every other sandbox merges back into. */
  isMain: boolean;
  description: string;
  createdBy: string;
  /** When it last changed (or, if nothing has, when it was made), as the API sends it; null if unknown. The page words it. */
  lastActivity: string | null;
  color: SandboxColor;
  /** The sandbox it was made from, and merges into by default. Main has none. */
  parent?: string;
  /** Workflows changed in it since it was made. */
  changes: SandboxChange[];
  /** Credentials that exist only in this sandbox, which merging can bring along. */
  credentials: string[];
}

/** What creating or editing a sandbox asks for. */
export interface SandboxDraft {
  /** As typed; the sandbox is named its slug. */
  name: string;
  color: SandboxColor;
  /** The sandbox to make it from. Only when creating. */
  parent?: string;
}

/** What merging a sandbox brings, and where. */
export interface SandboxMerge {
  /** The sandbox to merge into, usually its parent. */
  target: string;
  /** The changed workflows to bring across. */
  workflowIds: string[];
  /** The sandbox-only credentials to bring across. */
  credentials: string[];
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
