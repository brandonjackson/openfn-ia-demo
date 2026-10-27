import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FailureBreakdown from "./FailureBreakdown";
import type { FailureScope } from "./FailureBreakdown";
import { failureReasons, workOrders } from "../../mock-data/runs";
import type { ActivityPeriod } from "../../mock-data/runs";
import { nationalIdWorkflow } from "../../mock-data/workflow";

function ForStep(args: Partial<ComponentProps<typeof FailureBreakdown>>) {
  const [period, setPeriod] = useState<ActivityPeriod>("7d");
  const [scope, setScope] = useState<FailureScope>("step");
  return (
    <FailureBreakdown
      {...args}
      reasons={failureReasons(nationalIdWorkflow, workOrders, period, scope === "step" ? "create" : undefined)}
      period={period}
      onPeriodChange={setPeriod}
      stepLabel="Create new citizen in Identity"
      scope={scope}
      onScopeChange={setScope}
    />
  );
}

const meta: Meta<typeof FailureBreakdown> = {
  title: "Workflow/FailureBreakdown",
  component: FailureBreakdown,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="h-[420px] w-[420px] rounded-lg border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { latestVersion: "v2", onSelectRun: () => {} },
};

export default meta;
type Story = StoryObj<typeof FailureBreakdown>;

/** Every failure in the workflow, by reason. */
export const WholeWorkflow: Story = {
  args: { reasons: failureReasons(nationalIdWorkflow, workOrders, "30d"), period: "30d" },
};

/** Opened from a card's failed count: that step's failures, with the scope switch and period picker live. */
export const ForAStep: Story = { render: (args) => <ForStep {...args} /> };

export const NoFailures: Story = {
  args: { reasons: [], period: "24h", stepLabel: "Send confirmation notification with national ID", scope: "step", onScopeChange: () => {} },
};

/** In the inspector: no intro line, the share tinting each row, under the inspector's own heading. */
export const Compact: Story = {
  args: {
    reasons: failureReasons(nationalIdWorkflow, workOrders, "30d", "create"),
    period: "30d",
    stepLabel: "Create new citizen in Identity",
    scope: "step",
    compact: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[348px] px-4 py-3">
        <Story />
      </div>
    ),
  ],
};
