import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import SearchInput from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Shared/SearchInput",
  component: SearchInput,
  args: { value: "", onChange: () => {}, className: "w-96" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SearchInput {...args} value={value} onChange={setValue} />;
  },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};
export const WithText: Story = { args: { value: "dhis2" } };
export const Small: Story = { args: { size: "sm", placeholder: "Search templates" } };
export const TableFilter: Story = { args: { placeholder: "Filter users...", className: "max-w-sm" } };
