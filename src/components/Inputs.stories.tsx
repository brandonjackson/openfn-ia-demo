import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Select, TextArea, TextInput } from "./Inputs";

const meta: Meta = { title: "Shared/Inputs" };
export default meta;
type Story = StoryObj;

export const Text: Story = { render: () => <TextInput id="email" label="Email" required placeholder="you@example.org" /> };
export const TextWithError: Story = {
  render: () => <TextInput id="name" label="Name" defaultValue="" errors={["can't be blank"]} />,
};
export const Area: Story = { render: () => <TextArea id="desc" label="Description" rows={3} /> };
export const Dropdown: Story = {
  render: () => <Select id="role" label="Role" options={["viewer", "editor", "admin", "owner"]} prompt="Choose a role" />,
};
export const Check: Story = { render: () => <Checkbox label="Remember me" defaultChecked /> };
