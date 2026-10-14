import type { Meta, StoryObj } from "@storybook/react";
import { MenuItem } from "./Menu";
import SplitButton from "./SplitButton";

const meta: Meta<typeof SplitButton> = {
  title: "Shared/SplitButton",
  component: SplitButton,
  decorators: [(Story) => <div className="h-40 p-4 flex justify-end"><Story /></div>],
  args: {
    onClick: () => {},
    tooltip: "⌘ Enter",
    children: (
      <>
        <span className="hero-play-solid h-4 w-4" />
        Run
      </>
    ),
    menu: (
      <MenuItem icon="hero-play" description="⌘ ⇧ Enter">
        Run with custom input
      </MenuItem>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Primary: Story = {};
export const Secondary: Story = { args: { theme: "secondary" } };
export const Disabled: Story = { args: { disabled: true } };
