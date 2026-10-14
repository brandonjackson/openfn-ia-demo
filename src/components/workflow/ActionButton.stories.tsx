import type { Meta, StoryObj } from "@storybook/react";
import ActionButton from "./ActionButton";

const meta: Meta<typeof ActionButton> = { title: "Workflow/ActionButton", component: ActionButton, args: { children: "Create" } };
export default meta;
type Story = StoryObj<typeof ActionButton>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
