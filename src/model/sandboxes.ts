import type { SandboxColor } from "./page-data";
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
