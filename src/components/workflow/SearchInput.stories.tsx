import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import SearchInput from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Workflow/SearchInput",
  component: SearchInput,
  decorators: [(Story) => <div className="w-96 p-6"><Story /></div>],
  args: { value: "", onChange: () => {}, placeholder: "Search for an adaptor to connect..." },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {};
export const WithText: Story = { args: { value: "dhis2" } };
function Controlled({ placeholder }: { placeholder?: string }) {
  const [value, setValue] = useState("");
  return <SearchInput placeholder={placeholder} value={value} onChange={setValue} />;
}
export const Interactive: Story = { render: (args) => <Controlled placeholder={args.placeholder} /> };
