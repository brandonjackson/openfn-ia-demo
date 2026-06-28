/**
 * Theme registry for the Style Picker.
 *
 * Each entry is pure metadata used to render the picker UI. The actual
 * visual transformation lives entirely in `theme.css`, keyed by the
 * matching `data-theme` value on the <html> element. Adding a theme is
 * therefore two steps: a token block in `theme.css` and an entry here.
 */

export type ThemeId = "default" | "openfn" | "openfn-dark" | "brutalist";

export interface ThemeMeta {
  id: ThemeId;
  /** Display name shown in the picker. */
  name: string;
  /** One-line description of the look and feel. */
  description: string;
  /** Light or dark, used for the picker's mode dot. */
  mode: "light" | "dark";
  /** Representative colors (hex) rendered as swatches in the picker. */
  swatches: string[];
}

export const THEMES: ThemeMeta[] = [
  {
    id: "default",
    name: "Sim DTU",
    description: "The original product UI — indigo & blue on cool grays.",
    mode: "light",
    swatches: ["#4f46e5", "#2563eb", "#111827", "#f9fafb"],
  },
  {
    id: "openfn",
    name: "OpenFn",
    description: "Electric Teal on warm neutrals. The OpenFn design system.",
    mode: "light",
    swatches: ["#00c9a7", "#0d9488", "#121212", "#f4faf9"],
  },
  {
    id: "openfn-dark",
    name: "OpenFn Dark",
    description: "Teal-tinted neutral blacks with an electric teal accent.",
    mode: "dark",
    swatches: ["#00c9a7", "#80edd8", "#101a18", "#080e0d"],
  },
  {
    id: "brutalist",
    name: "Brutalist",
    description: "Stark monospace, sharp corners, hard offset shadows.",
    mode: "light",
    swatches: ["#111111", "#d4001f", "#f5c518", "#ffffff"],
  },
];

/** The theme applied when nothing is stored — the original look. */
export const DEFAULT_THEME_ID: ThemeId = "default";

/** localStorage key the chosen theme is persisted under. */
export const THEME_STORAGE_KEY = "openfn-ia-theme";

export const THEME_IDS = THEMES.map((t) => t.id);

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.includes(value as ThemeId);
}

export function getTheme(id: ThemeId): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
