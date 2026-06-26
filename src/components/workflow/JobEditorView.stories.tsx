import type { Meta, StoryObj } from "@storybook/react";
import JobEditorView from "./JobEditorView";
import { nationalIdWorkflow, sampleRun, type JobNode } from "../../mock-data/workflow";

const searchJob = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const queueJob = nationalIdWorkflow.nodes.find((n) => n.id === "queue") as JobNode;

const meta: Meta<typeof JobEditorView> = {
  title: "Workflow/JobEditorView",
  component: JobEditorView,
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
type Story = StoryObj<typeof JobEditorView>;

export const HttpJob: Story = {
  args: { job: searchJob, run: sampleRun },
};

export const CommonJob: Story = {
  args: { job: queueJob, run: sampleRun },
};
