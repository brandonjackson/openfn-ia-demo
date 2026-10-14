/**
 * Lightning.Helpers.url_safe_name/1: lowercases and swaps anything that isn't
 * a letter, digit, "_", "." or "-" for a dash, then trims dashes.
 * "My Project!!" -> "my-project".
 */
export function urlSafeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^\p{L}0-9_.-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
