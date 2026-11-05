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
