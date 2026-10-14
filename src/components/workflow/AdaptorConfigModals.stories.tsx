import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Button from "../Button";
import { findWorkflowGraph } from "../../mock-data/workflow";
import AdaptorConfigModals, { type AdaptorModal } from "./AdaptorConfigModals";

const graph = findWorkflowGraph("wf-dhis2-sheets")!;

function Demo({ initial, returnToConfigure }: { initial: AdaptorModal; returnToConfigure?: boolean }) {
  const [open, setOpen] = useState<AdaptorModal>(initial);
  const [job, setJob] = useState(graph.jobs[0]);
  return (
    <div className="space-y-2 text-sm">
      <p>
        {job.adaptor} {job.credentialName ? `(${job.credentialName})` : ""}
      </p>
      <Button theme="secondary" onClick={() => setOpen("configure")}>
        Configure
      </Button>
      <AdaptorConfigModals
        open={open}
        onOpenChange={setOpen}
        projectId={graph.projectId}
        job={job}
        adaptorsInUse={["dhis2", "googlesheets"]}
        onChange={(patch) => setJob((j) => ({ ...j, ...patch }))}
        returnToConfigure={returnToConfigure}
      />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Workflow/AdaptorConfigModals",
  component: Demo,
  args: { initial: "configure" },
};
export default meta;
type Story = StoryObj<typeof Demo>;

/** As in the IDE: closing the picker closes both. */
export const Configure: Story = {};
/** As in the job inspector: closing the picker goes back to "Configure connection". */
export const ReturnToConfigure: Story = { args: { returnToConfigure: true } };
export const Picker: Story = { args: { initial: "picker" } };
