/*
 * debt: a system's logo is looked up by its name here, from fixtures, so a
 * logo can be drawn where only the name is known. The data should carry the
 * adaptor id instead (each system row, channel and credential), and then this
 * map goes. Until then it's the one place below the wrappers that reads
 * fixtures; don't add another.
 */
// eslint-disable-next-line no-restricted-imports -- debt: see above
import { adaptors } from "../../fixtures/adaptors";
// eslint-disable-next-line no-restricted-imports -- debt: see above
import { connectedSystems, recommendedSystems } from "../../fixtures/connected-systems";

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

/*
 * Square logos copied from github.com/OpenFn/adaptors (packages/<id>/assets/square.png),
 * shrunk to 96px and 256 colours. They're inlined as data URLs so they arrive
 * with the code: as ~90 separate files, a list like "Add Connected System"
 * fired one request per row and any that dropped left an empty tile. Shrink a
 * new one the same way before adding it, so the bundle stays small.
 */
const logos = import.meta.glob<string>("../../assets/adaptors/*.png", {
  eager: true,
  query: "?inline",
  import: "default",
});

/** URL of an adaptor's square logo, or undefined if we don't have one. */
export function adaptorLogoUrl(adaptorId?: string): string | undefined {
  return adaptorId ? logos[`../../assets/adaptors/${adaptorId}.png`] : undefined;
}

export function hasAdaptorLogo(adaptorId?: string): boolean {
  return adaptorLogoUrl(adaptorId) !== undefined;
}
