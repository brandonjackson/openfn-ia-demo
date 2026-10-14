import type { Preview, Decorator } from "@storybook/react";
import "../src/index.css";
import { DEFAULT_THEME_ID, THEMES } from "../src/theme/themes";

/**
 * Reflects the toolbar-selected theme onto <html> so every story can be
 * previewed under any app theme — the same mechanism the app uses.
 */
const withTheme: Decorator = (Story, context) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(
      "data-theme",
      (context.globals.theme as string) || DEFAULT_THEME_ID
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
      description: "App theme",
      defaultValue: DEFAULT_THEME_ID,
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: THEMES.map((t) => ({
          value: t.id,
          title: t.id === DEFAULT_THEME_ID ? `${t.name} (default)` : t.name,
        })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
