import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import SearchInput from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Projects/SearchInput",
  component: SearchInput,
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SearchInput {...args} value={value} onChange={setValue} />;
  },
  args: { value: "", onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {};
export const WithTerm: Story = { args: { value: "openhie" } };
