import type { Meta, StoryObj } from "@storybook/react";
import SaveButton from "./SaveButton";

const meta: Meta<typeof SaveButton> = {
  title: "Workflow/SaveButton",
  component: SaveButton,
  args: { onClick: () => {} },
};
export default meta;
type Story = StoryObj<typeof SaveButton>;

export const Clean: Story = {};
export const Unsaved: Story = { args: { hasChanges: true } };
export const Create: Story = { args: { label: "Create", hasChanges: true } };
export const Disabled: Story = { args: { canSave: false, tooltip: "You do not have permission to edit this workflow" } };
