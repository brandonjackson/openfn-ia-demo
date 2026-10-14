import type { Meta, StoryObj } from "@storybook/react";
import AIButton from "./AIButton";

const meta: Meta<typeof AIButton> = { title: "Workflow/AIButton", component: AIButton };
export default meta;
type Story = StoryObj<typeof AIButton>;

export const Closed: Story = {};
export const Open: Story = { args: { isOpen: true } };
export const Disabled: Story = { args: { disabled: true } };
