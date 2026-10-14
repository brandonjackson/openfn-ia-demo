import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import ColorPalette from "./ColorPalette";

const meta: Meta<typeof ColorPalette> = {
  title: "Projects/Sandboxes/ColorPalette",
  component: ColorPalette,
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <ColorPalette {...args} value={value} onChange={setValue} />;
  },
  args: { value: "#F39B33", onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof ColorPalette>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
