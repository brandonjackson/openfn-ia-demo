/**
 * Theme registry for the Style Picker.
 *
 * Each entry is pure metadata used to render the picker UI. The actual
 * visual transformation lives entirely in `theme.css`, keyed by the
 * matching `data-theme` value on the <html> element. Adding a theme is
 * therefore two steps: a token block in `theme.css` and an entry here.
 */

export type ThemeId = "default" | "lightning-v2" | "gds";

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
    name: "Basic",
    description: "The original product UI — indigo & blue on cool grays.",
    mode: "light",
    swatches: ["#4f46e5", "#2563eb", "#111827", "#f9fafb"],
  },
  {
    id: "lightning-v2",
    name: "Lightning v2",
    description: "Today's Lightning app: deep indigo sidebar, Inter, white header bar on light gray.",
    mode: "light",
    swatches: ["#3730a3", "#4f46e5", "#111827", "#f3f4f6"],
  },
  {
    id: "gds",
    name: "GDS",
    description: "GOV.UK design system: blue links, green buttons, square and flat.",
    mode: "light",
    swatches: ["#1d70b8", "#0f7a52", "#0b0c0c", "#ffdd00"],
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
