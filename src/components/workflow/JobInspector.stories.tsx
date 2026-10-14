import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import JobInspector from "./JobInspector";
import { withSidePanel } from "../../stories/decorators";

const graph = findWorkflowGraph("wf-openhie")!;
const noop = () => {};

const meta: Meta<typeof JobInspector> = {
  title: "Workflow/JobInspector",
  component: JobInspector,
  decorators: [withSidePanel()],
  args: {
    job: graph.jobs[0],
    projectId: graph.projectId,
    adaptorsInUse: ["http"],
    onChange: noop,
    onClose: noop,
    onOpenEditor: noop,
    onDelete: noop,
    onRunFromHere: noop,
  },
};
export default meta;
type Story = StoryObj<typeof JobInspector>;

export const Http: Story = {};
export const WithCredential: Story = { args: { job: findWorkflowGraph("wf-dhis2-sheets")!.jobs[0] } };
export const NeedsCredential: Story = { args: { job: findWorkflowGraph("wf-dhis2-sheets")!.jobs[1] } };
export const CannotDelete: Story = { args: { canDelete: false } };
