import type { Meta, StoryObj } from "@storybook/react";
import EditorLayout from "./EditorLayout";
import Tray from "./Tray";
import StepExplorer from "./StepExplorer";
import StepInspector from "./StepInspector";
import WorkflowCanvas from "./WorkflowCanvas";
import CodeEditor from "./CodeEditor";
import RunOutput from "./RunOutput";
import EditorShell from "./EditorShell";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { JobNode } from "../../mock-data/workflow";
import { dataclips, sampleRun } from "../../mock-data/runs";

const search = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const step = sampleRun.steps.find((s) => s.jobId === "search");

const meta: Meta<typeof EditorLayout> = {
  title: "Workflow/EditorLayout",
  component: EditorLayout,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditorLayout>;

/** Code: everything flush in one card. */
export const Docked: Story = {
  render: () => (
    <EditorShell mode="code" toolbar={<div className="h-[72px]" />}>
      <EditorLayout
        left={
          <Tray dock="left" trays={["steps"]} active="steps" size={280}>
            <StepExplorer workflow={nationalIdWorkflow} selectedId="search" run={sampleRun} />
          </Tray>
        }
        right={
          <Tray dock="right" trays={["inspect"]} active="inspect" size={320}>
            <StepInspector workflow={nationalIdWorkflow} node={search} readOnly />
          </Tray>
        }
        bottom={
          <Tray dock="bottom" trays={["run"]} active="run" size={220}>
            <RunOutput run={sampleRun} step={step} stepOpen view="Log" dataclips={dataclips} />
          </Tray>
        }
      >
        <CodeEditor code={search.body} />
      </EditorLayout>
    </EditorShell>
  ),
};

/** Canvas: trays float as cards over the diagram. */
export const Floating: Story = {
  render: () => (
    <EditorShell mode="canvas" toolbar={<div className="h-[72px]" />}>
      <EditorLayout
        floating
        left={
          <Tray dock="left" trays={["steps"]} active="steps" size={280} floating>
            <StepExplorer workflow={nationalIdWorkflow} selectedId="search" />
          </Tray>
        }
        bottom={
          <Tray dock="bottom" trays={["run"]} active="run" size={220} floating>
            <RunOutput run={sampleRun} step={step} stepOpen view="Output" dataclips={dataclips} />
          </Tray>
        }
      >
        <WorkflowCanvas workflow={nationalIdWorkflow} selectedId="search" run={sampleRun} fill transparent />
      </EditorLayout>
    </EditorShell>
  ),
};
