import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReportOutcomeView from "./ReportOutcomeView";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import type { OutcomeTool } from "../../model/step-tools";

/** The national ID workflow's "already registered" outcome: a refusal, from a run that went fine. */
const refused = nationalIdWorkflow.nodes.find((n) => n.id === "outcome-already-registered");
const tool = (refused?.type === "job" && refused.tool?.kind === "outcome" ? refused.tool : { kind: "outcome", status: "refused", description: "" }) as OutcomeTool;

/** The view with its changes kept, as the editor keeps them. */
function Editing({ initial }: { initial: OutcomeTool }) {
  const [value, setValue] = useState(initial);
  return <ReportOutcomeView tool={value} onChange={setValue} />;
}

const meta: Meta<typeof ReportOutcomeView> = {
  title: "Domain/ReportOutcomeView",
  component: ReportOutcomeView,
  args: { tool },
  decorators: [
    (Story) => (
      <div style={{ height: 640 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReportOutcomeView>;

/** In a sandbox: pick the outcome and write what happened. */
export const Editable: Story = {
  render: (args) => <Editing initial={args.tool} />,
};

/** On main it only reads. */
export const ReadOnly: Story = {};

/** A new step, before anyone has said what happened. */
export const New: Story = {
  render: () => <Editing initial={{ kind: "outcome", status: "success", description: "" }} />,
};
