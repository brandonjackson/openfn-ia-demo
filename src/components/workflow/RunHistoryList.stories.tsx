import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RunHistoryList from "./RunHistoryList";
import VersionMismatchBanner from "./VersionMismatchBanner";
import { olderRun, sampleRun, workOrders } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof RunHistoryList>) {
    const [selected, setSelected] = useState(args.selectedRunId);
    return (
      <RunHistoryList
        {...args}
        selectedRunId={selected}
        onSelectRun={(r) => setSelected(r.runId)}
        onDeselectRun={() => setSelected(undefined)}
      />
    );
}

const meta: Meta<typeof RunHistoryList> = {
  title: "Workflow/RunHistoryList",
  component: RunHistoryList,
  decorators: [
    (Story) => (
      <div className="h-[480px] w-[380px] border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { workOrders, latestVersion: "v2" },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof RunHistoryList>;

export const Default: Story = {};

export const RunSelected: Story = { args: { selectedRunId: sampleRun.runId } };

/** A v1 run selected while the latest version is on the canvas. */
export const WithMismatchBanner: Story = {
  args: {
    selectedRunId: olderRun.runId,
    footer: <VersionMismatchBanner runVersion="v1" viewingVersion="v2" onViewAsExecuted={() => {}} />,
  },
};

export const Empty: Story = { args: { workOrders: [] } };
