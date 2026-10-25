import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RecentHistoryPanel from "./RecentHistoryPanel";
import VersionMismatchBanner from "./VersionMismatchBanner";
import { olderRun, workOrders } from "../../mock-data/runs";

/** Keeps the selected run so clicking rows responds. */
function ControlledPanel(args: ComponentProps<typeof RecentHistoryPanel>) {
  const [runId, setRunId] = useState(args.selectedRunId);
  return (
    <RecentHistoryPanel
      {...args}
      selectedRunId={runId}
      onSelectRun={(run) => setRunId(run.runId)}
      onDeselectRun={() => setRunId(undefined)}
    />
  );
}

const meta: Meta<typeof RecentHistoryPanel> = {
  title: "Workflow/RecentHistoryPanel",
  component: RecentHistoryPanel,
  parameters: { layout: "padded" },
  args: { workOrders, latestVersion: "v2" },
  render: (args) => <ControlledPanel {...args} />,
};

export default meta;
type Story = StoryObj<typeof RecentHistoryPanel>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { selectedRunId: workOrders[0].runs[0].runId },
};

/** A work order that was retried shows both runs. */
export const RetriedWorkOrder: Story = {
  args: { selectedRunId: workOrders.find((o) => o.runs.length > 1)!.runs[1].runId },
};

/** A run on an older version: the banner offers to show the version that ran. */
export const OlderRunSelected: Story = {
  args: {
    selectedRunId: olderRun.runId,
    footer: <VersionMismatchBanner runVersion="v1" viewingVersion="v2" onViewAsExecuted={() => {}} />,
  },
};

/** Collapsed, the panel keeps a chip for the selected run. */
export const Collapsed: Story = {
  args: { selectedRunId: workOrders[0].runs[0].runId, defaultCollapsed: true },
};

/** A brand-new workflow that hasn't run yet. */
export const Empty: Story = { args: { workOrders: [] } };

/** Without its card and header, to fill a tray in the editor. */
export const Bare: Story = {
  args: { selectedRunId: workOrders[0].runs[0].runId, bare: true },
  decorators: [(Story) => <div style={{ width: 300 }}><Story /></div>],
};
