import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext } from "./theme-context";
import {
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  THEMES,
  isThemeId,
  type ThemeId,
} from "./themes";

/** Reflect the active theme onto <html> so `theme.css` can re-skin the app. */
function applyThemeToDocument(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
}

/** Resolve the initial theme from localStorage, then the <html> attribute. */
function readInitialTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    /* localStorage may be unavailable (private mode, SSR) — ignore. */
  }
  const attr = document.documentElement.getAttribute("data-theme");
  return isThemeId(attr) ? attr : DEFAULT_THEME_ID;
}

/**
 * Tracks the active theme, persists the choice, and keeps the
 * `data-theme` attribute on <html> in sync. Wrap the app (and the
 * StylePicker) in this provider.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(readInitialTheme);

  useEffect(() => {
    applyThemeToDocument(themeId);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      /* ignore persistence failures */
    }
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => setThemeId(id), []);

  const value = useMemo(
    () => ({ themeId, setTheme, themes: THEMES }),
    [themeId, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
