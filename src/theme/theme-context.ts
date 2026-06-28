import { createContext, useContext } from "react";
import { DEFAULT_THEME_ID, THEMES, type ThemeId, type ThemeMeta } from "./themes";

export interface ThemeContextValue {
  /** The currently active theme id. */
  themeId: ThemeId;
  /** Switch to a different theme (persisted + applied to <html>). */
  setTheme: (id: ThemeId) => void;
  /** All registered themes, for rendering the picker. */
  themes: ThemeMeta[];
}

export const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  setTheme: () => {},
  themes: THEMES,
});

/** Read the active theme and a setter from anywhere in the tree. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
