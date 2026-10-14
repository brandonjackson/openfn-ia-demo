import type { Meta, StoryObj } from "@storybook/react";
import PasswordInput from "./PasswordInput";

const meta: Meta<typeof PasswordInput> = {
  title: "Auth/PasswordInput",
  component: PasswordInput,
  decorators: [(Story) => <div className="max-w-md p-6">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = { args: { id: "password", label: "Password" } };
export const Required: Story = { args: { id: "password", label: "Password", required: true } };
export const WithHint: Story = {
  args: { id: "password", label: "New password", hint: "At least 12 characters" },
};
export const NoLabel: Story = { args: { id: "password" } };
export const WithError: Story = {
  args: { id: "password", label: "Password", errors: ["should be at least 8 character(s)"], defaultValue: "short" },
};
