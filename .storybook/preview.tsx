import type { Preview, Decorator } from "@storybook/react";
import "../src/index.css";
import { DEFAULT_THEME_ID, THEMES } from "../src/theme/themes";

/**
 * Every deploy replaces the whole published Storybook, and GitHub Pages lets
 * browsers cache iframe.html for ten minutes. A tab opened before a deploy, or
 * a cached iframe.html, asks for story chunks whose old hashed names are gone
 * and shows "Failed to fetch dynamically imported module". When that happens,
 * reload the preview once under a fresh URL so the cache can't answer, which
 * picks up the new build. The timestamp stops a loop if a chunk really is
 * missing.
 */
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    const key = "storybook:reloaded-for-stale-chunk";
    try {
      const last = Number(sessionStorage.getItem(key) ?? 0);
      if (Date.now() - last < 10_000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      return;
    }
    event.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set("build", String(Date.now()));
    window.location.replace(url.toString());
  });
}

/**
 * Reflects the toolbar-selected theme onto <html> so every story can be
 * previewed under any Style Picker theme — the same mechanism the app uses.
 */
const withTheme: Decorator = (Story, context) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(
      "data-theme",
      (context.globals.theme as string) || "default"
    );
  }
  return <Story />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "OpenFn Style Picker theme",
      defaultValue: "default",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          ...THEMES.map((t) => ({ value: t.id, title: t.id === DEFAULT_THEME_ID ? `${t.name} (default)` : t.name })),
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
