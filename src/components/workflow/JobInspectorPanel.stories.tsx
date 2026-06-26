import type { Meta, StoryObj } from "@storybook/react";
import JobInspectorPanel from "./JobInspectorPanel";
import { nationalIdWorkflow, type JobNode } from "../../mock-data/workflow";

const searchJob = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const queueJob = nationalIdWorkflow.nodes.find((n) => n.id === "queue") as JobNode;

const meta: Meta<typeof JobInspectorPanel> = {
  title: "Workflow/JobInspectorPanel",
  component: JobInspectorPanel,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof JobInspectorPanel>;

export const HttpJob: Story = { args: { job: searchJob } };
export const CommonJob: Story = { args: { job: queueJob } };
