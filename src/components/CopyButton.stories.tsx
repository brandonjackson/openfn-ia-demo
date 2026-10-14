import type { Meta, StoryObj } from "@storybook/react";
import CopyButton from "./CopyButton";

const meta: Meta<typeof CopyButton> = {
  title: "Shared/CopyButton",
  component: CopyButton,
  args: { value: "https://app.openfn.org/i/8f3c2a91" },
};
export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Icon: Story = {};
export const SmallIcon: Story = { args: { size: "sm", label: "Copy Default URL" } };
export const WithText: Story = { args: { children: "Copy Code" } };
