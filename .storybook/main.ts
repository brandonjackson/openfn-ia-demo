import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: "@storybook/react-vite",
  addons: [],
  // Adaptor icons and the logo live in public/.
  staticDirs: ["../public"],
};

export default config;
