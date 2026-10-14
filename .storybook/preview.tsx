import type { Preview, Decorator } from "@storybook/react";
import "../src/index.css";

/**
 * Reflects the toolbar-selected theme onto <html> so every story can be
 * previewed under any Style Picker theme — the same mechanism the app uses.
 */
const withTheme: Decorator = (Story, context) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(
      "data-theme",
      (context.globals.theme as string) || "lightning-v2"
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
      defaultValue: "lightning-v2",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "lightning-v2", title: "Lightning v2 (default)" },
          { value: "gds", title: "GDS" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
