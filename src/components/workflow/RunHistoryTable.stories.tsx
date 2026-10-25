import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RunHistoryTable from "./RunHistoryTable";
import { sampleRun, workOrders } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof RunHistoryTable>) {
    const [selected, setSelected] = useState(args.selectedRunId);
    return <RunHistoryTable {...args} selectedRunId={selected} onSelectRun={(r) => setSelected(r.runId)} />;
}

const meta: Meta<typeof RunHistoryTable> = {
  title: "Workflow/RunHistoryTable",
  component: RunHistoryTable,
  parameters: { layout: "padded" },
  args: { workOrders, latestVersion: "v2" },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof RunHistoryTable>;

export const Default: Story = {};
export const RunSelected: Story = { args: { selectedRunId: sampleRun.runId } };
export const Empty: Story = { args: { workOrders: [] } };
