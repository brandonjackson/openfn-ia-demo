import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SearchInput from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  args: { placeholder: "Search systems and tools..." },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};

/** Dense, for a narrow panel such as the adaptor reference. */
export const Compact: Story = {
  args: { compact: true, placeholder: "Search http operations" },
};

function Controlled() {
  const [query, setQuery] = useState("dhis");
  return (
    <div className="space-y-2">
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" />
      <p className="text-xs text-gray-500">Query: {query || "(empty)"}</p>
    </div>
  );
}

export const WithValue: Story = { render: () => <Controlled /> };
