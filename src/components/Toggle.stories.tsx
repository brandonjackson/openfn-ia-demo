import type { Meta, StoryObj } from "@storybook/react";
import Toggle from "./Toggle";

const meta: Meta<typeof Toggle> = { title: "Shared/Toggle", component: Toggle, args: { checked: true } };
export default meta;
type Story = StoryObj<typeof Toggle>;

export const On: Story = {};
export const Off: Story = { args: { checked: false } };
export const WithLabel: Story = {
  args: { label: "Require MFA", description: "Every collaborator must use multi-factor authentication." },
};
export const Disabled: Story = { args: { disabled: true } };
export const WithTooltip: Story = { args: { disabled: true, tooltip: "Only owners can change this" } };
