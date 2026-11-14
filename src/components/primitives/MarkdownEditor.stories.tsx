import type { Meta, StoryObj } from "@storybook/react";
import MarkdownEditor from "./MarkdownEditor";
import Card from "./Card";
import { workflowDocs } from "../../fixtures/workflow-files";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof MarkdownEditor> = {
  title: "Primitives/MarkdownEditor",
  component: MarkdownEditor,
  decorators: [withRouter],
  args: { source: workflowDocs.spec, label: "spec.md", onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof MarkdownEditor>;

/** Drawn as it reads, with Edit above it; Edit turns it into the code editor with Cancel and Save. */
export const Default: Story = {};

/** Without `onSave` it only reads. */
export const ReadOnly: Story = { args: { onSave: undefined } };

/** The buttons in a card's header, through `children`. */
export const InACard: Story = {
  render: (args) => (
    <MarkdownEditor {...args}>
      {({ actions, body }) => (
        <Card title="spec.md" actions={actions}>
          {body}
        </Card>
      )}
    </MarkdownEditor>
  ),
};

/** Nothing written yet. */
export const Empty: Story = { args: { source: "" } };

/** A save the server refuses: the draft stays, with why over it. */
export const SaveRefused: Story = { args: { onSave: () => Promise.reject(new Error("Someone else saved it first.")) } };
