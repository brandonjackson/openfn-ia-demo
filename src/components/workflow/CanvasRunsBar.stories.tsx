import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CanvasRunsBar from "./CanvasRunsBar";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { RunDetails } from "../../mock-data/workflow";
import { failedRun, filterWorkOrders, runActivity, workOrders } from "../../mock-data/runs";
import type { ActivityPeriod, RunStatusFilter } from "../../mock-data/runs";

/** The bar with its state kept, so the period, filter, list and loaded run all work. */
function Stateful(args: Partial<ComponentProps<typeof CanvasRunsBar>>) {
  const [period, setPeriod] = useState<ActivityPeriod>(args.period ?? "7d");
  const [showing, setShowing] = useState(args.showing ?? true);
  const [status, setStatus] = useState<RunStatusFilter>(args.status ?? "all");
  const [open, setOpen] = useState(args.open ?? false);
  const [run, setRun] = useState<RunDetails | undefined>(args.run);
  const orders = args.workOrders ?? workOrders;
  return (
    <CanvasRunsBar
      period={period}
      onPeriodChange={setPeriod}
      showing={showing}
      onShowingChange={setShowing}
      status={status}
      onStatusChange={setStatus}
      activity={showing ? runActivity(nationalIdWorkflow, filterWorkOrders(orders, period, status), period) : undefined}
      workOrders={orders}
      run={run}
      onUnloadRun={() => setRun(undefined)}
      latestVersion="v2"
      onSelectRun={setRun}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

const meta: Meta<typeof CanvasRunsBar> = {
  title: "Workflow/CanvasRunsBar",
  component: CanvasRunsBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex h-[620px] justify-center bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] pt-3 [background-size:22px_22px]">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof CanvasRunsBar>;

/** Run history for the last 7 days: how many runs and how many failed. */
export const Default: Story = { args: {} };

/** Off: just the workflow, with no run history. */
export const Off: Story = { args: { showing: false } };

/** Filter open: the runs in the period, with the status filter the canvas follows. */
export const FilterOpen: Story = { args: { open: true, period: "30d" } };

/** Filtered to failed runs, as when the failed count is clicked. */
export const FailedOnly: Story = { args: { open: true, period: "30d", status: "failed" } };

/** A run loaded, with the way to unload it. */
export const RunLoaded: Story = { args: { run: failedRun } };

/** A brand-new workflow with no runs. */
export const NoRuns: Story = { args: { workOrders: [], open: true } };
