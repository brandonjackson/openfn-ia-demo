import type { Meta, StoryObj } from "@storybook/react";
import WorkflowDocView from "./WorkflowDocView";
import { workflowDocs } from "../../fixtures/workflow-files";

const meta: Meta<typeof WorkflowDocView> = {
  title: "Domain/WorkflowDocView",
  component: WorkflowDocView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 760 }}>
        <Story />
      </div>
    ),
  ],
  args: { onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof WorkflowDocView>;

/** context.md in a sandbox: drawn as it reads, with Edit. */
export const Context: Story = {
  args: { name: "context.md", description: "The legislation behind the workflow and the groups of citizens it affects.", content: workflowDocs.context },
};

/** spec.md, with its tables and a code block. */
export const Spec: Story = {
  args: { name: "spec.md", description: "What goes in, what each step writes, and when a run counts as done.", content: workflowDocs.spec },
};

/** On main it reads only, with "Edit in sandbox" where Edit would be. */
export const OnMain: Story = {
  args: { name: "spec.md", content: workflowDocs.spec, onSave: undefined, onEditInSandbox: () => {} },
};

/** A doc that's just been added, with nothing in it yet. */
export const Empty: Story = {
  args: { name: "runbook.md", content: "" },
};

/** Saving is refused: the editor keeps what was written and says why. */
export const SaveRefused: Story = {
  args: { name: "notes.md", content: "# Notes\n", onSave: () => Promise.reject(new Error("Someone else saved it first.")) },
};
