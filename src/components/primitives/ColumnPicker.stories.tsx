import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ColumnPicker, { type ColumnOption } from "./ColumnPicker";
import Inline from "./Inline";

const options: ColumnOption[] = [
  { id: "project", label: "Project" },
  { id: "received", label: "Received" },
  { id: "outcome", label: "Outcome", group: "Workflows" },
  { id: "runs", label: "Runs", group: "Workflows" },
  { id: "system", label: "System", group: "Channels" },
  { id: "endpoint", label: "Endpoint", group: "Channels" },
];

function Picker({ initial = [], defaultOpen = false, grouped = true }: { initial?: string[]; defaultOpen?: boolean; grouped?: boolean }) {
  const [value, setValue] = useState(initial);
  return (
    <Inline justify="end">
      <ColumnPicker options={grouped ? options : options.map((o) => ({ id: o.id, label: o.label }))} value={value} onChange={setValue} defaultOpen={defaultOpen} />
    </Inline>
  );
}

const meta: Meta<typeof ColumnPicker> = {
  title: "Primitives/ColumnPicker",
  component: ColumnPicker,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ColumnPicker>;

/** Closed, with nothing added: the table shows only its own columns. */
export const Default: Story = { render: () => <Picker /> };

/** Open, with the options grouped by the rows they apply to. */
export const Open: Story = { render: () => <Picker defaultOpen initial={["project", "endpoint"]} /> };

/** Open, with no groups. */
export const Ungrouped: Story = { render: () => <Picker defaultOpen grouped={false} initial={["received"]} /> };
