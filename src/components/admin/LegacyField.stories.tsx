import type { Meta, StoryObj } from "@storybook/react";
import LegacyField from "./LegacyField";

const meta: Meta<typeof LegacyField> = {
  title: "Admin/LegacyField",
  component: LegacyField,
  decorators: [(Story) => <div className="w-96"><Story /></div>],
  args: { id: "auth_provider_name", label: "Name", defaultValue: "" },
};
export default meta;
type Story = StoryObj<typeof LegacyField>;

export const Text: Story = {};
export const WithHint: Story = {
  args: { hint: <span className="text-xs text-secondary-500">The name of the provider, used in the redirect URI.</span> },
};
export const Password: Story = { args: { id: "client_secret", label: "Client Secret", type: "password", defaultValue: "secret" } };
