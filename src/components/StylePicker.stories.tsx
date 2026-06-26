import type { Meta, StoryObj } from "@storybook/react";
import StylePicker from "./StylePicker";
import { ThemeProvider } from "../theme/ThemeProvider";

const meta: Meta<typeof StylePicker> = {
  title: "Components/StylePicker",
  component: StylePicker,
  // The picker reads the active theme from context, so wrap it in the provider.
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof StylePicker>;

/** The collapsed control as it sits in the corner of the app. */
export const Default: Story = {
  render: () => (
    <div className="h-screen w-full bg-gray-50 p-8 text-gray-700">
      <p className="text-sm">
        The Style Picker lives in the bottom-right corner. Click the palette
        button to switch themes — every component re-skins instantly.
      </p>
      <StylePicker />
    </div>
  ),
};

/** The expanded panel showing every available theme. */
export const Open: Story = {
  render: () => (
    <div className="h-screen w-full bg-gray-50 p-8">
      <StylePicker defaultOpen />
    </div>
  ),
};
