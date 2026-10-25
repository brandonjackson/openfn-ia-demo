import type { Meta, StoryObj } from "@storybook/react";
import EditorStatusBar from "./EditorStatusBar";

const meta: Meta<typeof EditorStatusBar> = {
  title: "Workflow/EditorStatusBar",
  component: EditorStatusBar,
  parameters: { layout: "fullscreen" },
  args: { adaptor: "common", file: "Map fields", lines: 15, state: "saved" },
};

export default meta;
type Story = StoryObj<typeof EditorStatusBar>;

export const Saved: Story = {};

export const Edited: Story = { args: { state: "edited" } };

/** On main; the reason is in the tooltip. */
export const ReadOnly: Story = { args: { state: "read-only", readOnlyReason: "main is read-only" } };

export const WorkflowYaml: Story = { args: { adaptor: undefined, file: "workflow.yaml", lines: 90 } };
