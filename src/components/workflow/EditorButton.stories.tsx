import type { Meta, StoryObj } from "@storybook/react";
import EditorButton from "./EditorButton";

const meta: Meta<typeof EditorButton> = {
  title: "Workflow/EditorButton",
  component: EditorButton,
  args: { children: "Run From Here" },
};
export default meta;
type Story = StoryObj<typeof EditorButton>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Edit" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Cancel" } };
export const NakedClose: Story = { args: { variant: "nakedClose", children: undefined } };
export const Disabled: Story = { args: { disabled: true } };
