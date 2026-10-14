import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import NameField from "./NameField";

const meta: Meta<typeof NameField> = {
  title: "Shared/NameField",
  component: NameField,
  args: { id: "project_raw_name", value: "My Project!!", badgeLabel: "Your project will be named", required: true, onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof NameField>;

export const Default: Story = {};
export const Empty: Story = { args: { value: "" } };
export const WithHint: Story = {
  args: {
    id: "collection_raw_name",
    value: "Patient Records",
    badgeLabel: "This collection will be named",
    hint: "Collection names must be unique across all projects within this instance.",
  },
};
export const WithErrors: Story = { args: { value: "!!", errors: ["can't be blank"], hideBadgeOnError: true } };
function InteractiveNameField(args: Parameters<typeof NameField>[0]) {
  const [value, setValue] = useState("");
  return <NameField {...args} value={value} onChange={setValue} />;
}
export const Interactive: Story = { render: (args) => <InteractiveNameField {...args} /> };
