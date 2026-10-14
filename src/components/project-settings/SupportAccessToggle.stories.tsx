import type { Meta, StoryObj } from "@storybook/react";
import SupportAccessToggle from "./SupportAccessToggle";

const meta: Meta<typeof SupportAccessToggle> = {
  title: "Project settings/SupportAccessToggle",
  component: SupportAccessToggle,
  args: { checked: false, canEditProject: true, onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof SupportAccessToggle>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
