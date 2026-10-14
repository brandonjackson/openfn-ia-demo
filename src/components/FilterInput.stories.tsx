import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FilterInput from "./FilterInput";

const meta: Meta<typeof FilterInput> = { title: "Shared/FilterInput", component: FilterInput };
export default meta;
type Story = StoryObj<typeof FilterInput>;

function Stateful({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return <FilterInput value={value} onChange={setValue} placeholder="Filter users..." />;
}

export const Empty: Story = { render: () => <Stateful initial="" /> };
export const WithText: Story = { render: () => <Stateful initial="editor" /> };
