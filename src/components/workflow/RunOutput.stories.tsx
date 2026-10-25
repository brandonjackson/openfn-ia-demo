import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RunOutput, { RunOutputChip, RunOutputHeader } from "./RunOutput";
import type { RunView } from "./RunOutput";
import Tray from "./Tray";
import VersionMismatchBanner from "./VersionMismatchBanner";
import { dataclips, failedRun, olderRun, sampleRun } from "../../mock-data/runs";
import type { RunDetails } from "../../mock-data/workflow";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const label = (jobId: string) => nationalIdWorkflow.nodes.find((n) => n.id === jobId)?.label;

/** The Run tray as it appears in the editor's bottom dock. */
function RunTray({ run, jobId, view: initial = "Log" }: { run?: RunDetails; jobId?: string; view?: RunView }) {
  const [view, setView] = useState<RunView>(initial);
  const step = run?.steps.find((s) => s.jobId === jobId);
  return (
    <Tray
      dock="bottom"
      trays={["run"]}
      active="run"
      size={300}
      floating
      actions={
        <RunOutputChip run={run} step={step} stepLabel={jobId ? label(jobId) : undefined} onClearRun={() => {}} />
      }
      headerExtra={
        <RunOutputHeader
          run={run}
          step={step}
          stepLabel={jobId ? label(jobId) : undefined}
          view={view}
          onViewChange={setView}
        />
      }
    >
      <RunOutput
        run={run}
        step={step}
        stepOpen={jobId !== undefined}
        view={view}
        dataclips={dataclips}
        onRun={() => {}}
        onOpenHistory={() => {}}
        notice={
          run?.version === "v1" && (
            <VersionMismatchBanner runVersion="v1" viewingVersion="v2" onViewAsExecuted={() => {}} />
          )
        }
      />
    </Tray>
  );
}

const meta: Meta<typeof RunOutput> = {
  title: "Workflow/RunOutput",
  component: RunOutput,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RunOutput>;

/** Following one step: its log lines. */
export const StepLog: Story = { render: () => <RunTray run={sampleRun} jobId="search" /> };

export const StepOutput: Story = { render: () => <RunTray run={sampleRun} jobId="create" view="Output" /> };

/** No step open: the whole run's steps. */
export const Summary: Story = { render: () => <RunTray run={failedRun} view="Summary" /> };

/** The open step wasn't part of the run. */
export const StepNotInRun: Story = { render: () => <RunTray run={failedRun} jobId="confirm" view="Input" /> };

/** A run on an older version, with the offer to view it as executed. */
export const OlderVersion: Story = { render: () => <RunTray run={olderRun} jobId="create" /> };

export const NoRunSelected: Story = { render: () => <RunTray /> };
