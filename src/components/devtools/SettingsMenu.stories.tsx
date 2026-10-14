import type { Meta, StoryObj } from "@storybook/react";
import SettingsMenu from "./SettingsMenu";
import { ThemeProvider } from "../../theme/ThemeProvider";
import { AnnotationsProvider } from "../../annotations/AnnotationsContext";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SettingsMenu> = {
  title: "Devtools/SettingsMenu",
  component: SettingsMenu,
  // Reads the theme and the annotations panel state from context.
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AnnotationsProvider>
          <Story />
        </AnnotationsProvider>
      </ThemeProvider>
    ),
    withRouter,
  ],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof SettingsMenu>;

/** The button as it sits in the bottom-right corner of the app. */
export const Default: Story = {
  render: () => (
    <div className="h-screen w-full bg-gray-50 p-8 text-sm text-gray-700">
      The settings button lives in the bottom-right corner.
      <SettingsMenu />
    </div>
  ),
};

/** The open menu: the annotations panel switch and the themes. */
export const Open: Story = {
  render: () => (
    <div className="h-screen w-full bg-gray-50 p-8">
      <SettingsMenu defaultOpen />
    </div>
  ),
};
