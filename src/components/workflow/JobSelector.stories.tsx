import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import JobSelector from "./JobSelector";

const jobs = findWorkflowGraph("wf-openhie")!.jobs;
const meta: Meta<typeof JobSelector> = {
  title: "Workflow/JobSelector",
  component: JobSelector,
  decorators: [(Story) => <div className="h-72 p-4"><Story /></div>],
  args: { currentJob: jobs[0], jobs, onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof JobSelector>;

export const Default: Story = {};
export const NoJob: Story = { args: { currentJob: null } };
