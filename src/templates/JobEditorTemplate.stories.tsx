import type { Meta, StoryObj } from "@storybook/react";
import JobEditorTemplate from "./JobEditorTemplate";
import { nationalIdWorkflow, sampleRun, type JobNode } from "../mock-data/workflow";

const searchJob = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;

const meta: Meta<typeof JobEditorTemplate> = {
  title: "Templates/JobEditorTemplate",
  component: JobEditorTemplate,
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
type Story = StoryObj<typeof JobEditorTemplate>;

export const Default: Story = {
  args: { workflow: nationalIdWorkflow, job: searchJob, run: sampleRun },
};
