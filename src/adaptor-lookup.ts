import { adaptors } from "./mock-data/adaptors";
import { connectedSystems, recommendedSystems } from "./mock-data/connected-systems";

const byName = new Map<string, string>();
for (const a of adaptors) byName.set(a.name.toLowerCase(), a.id);
for (const s of recommendedSystems) if (s.adaptor) byName.set(s.name.toLowerCase(), s.adaptor);
for (const s of connectedSystems) {
  byName.set(s.name.toLowerCase(), s.adaptor);
  byName.set(s.id, s.adaptor);
}

/**
 * The adaptor id behind a system name (e.g. "Google Sheets" → "googlesheets"),
 * so anywhere that only knows a system's name can show its logo.
 */
export function adaptorForSystem(name?: string): string | undefined {
  return name ? byName.get(name.toLowerCase()) : undefined;
}

// Square logos copied from github.com/OpenFn/adaptors (packages/<id>/assets/square.png).
const logos = import.meta.glob<string>("./assets/adaptors/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

/** URL of an adaptor's square logo, or undefined if we don't have one. */
export function adaptorLogoUrl(adaptorId?: string): string | undefined {
  return adaptorId ? logos[`./assets/adaptors/${adaptorId}.png`] : undefined;
}

export function hasAdaptorLogo(adaptorId?: string): boolean {
  return adaptorLogoUrl(adaptorId) !== undefined;
}
