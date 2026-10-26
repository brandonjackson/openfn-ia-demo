import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RunPicker from "./RunPicker";
import VersionMismatchBanner from "./VersionMismatchBanner";
import type { RunDetails } from "../../mock-data/workflow";
import { olderRun, sampleRun, workOrders } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof RunPicker>) {
  const [run, setRun] = useState<RunDetails | undefined>(args.selectedRun);
  return <RunPicker {...args} selectedRun={run} onSelectRun={setRun} onDeselectRun={() => setRun(undefined)} />;
}

const meta: Meta<typeof RunPicker> = {
  title: "Workflow/RunPicker",
  component: RunPicker,
  decorators: [
    (Story) => (
      <div className="flex h-[520px] justify-end p-4">
        <Story />
      </div>
    ),
  ],
  args: { workOrders, latestVersion: "v2" },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof RunPicker>;

export const Empty: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const RunLoaded: Story = { args: { selectedRun: sampleRun } };

/** A v1 run loaded while the latest version is showing. */
export const OlderRunLoaded: Story = {
  args: {
    selectedRun: olderRun,
    defaultOpen: true,
    footer: <VersionMismatchBanner runVersion="v1" viewingVersion="v2" onViewAsExecuted={() => {}} />,
  },
};
