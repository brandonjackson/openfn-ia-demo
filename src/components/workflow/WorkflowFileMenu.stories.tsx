import type { Meta, StoryObj } from "@storybook/react";
import WorkflowFileMenu from "./WorkflowFileMenu";

const meta: Meta<typeof WorkflowFileMenu> = {
  title: "Workflow/WorkflowFileMenu",
  component: WorkflowFileMenu,
  parameters: { layout: "padded" },
  args: { projectName: "Project A", defaultOpen: true, visibleTrays: ["history"], onAction: () => {} },
  decorators: [
    (Story) => (
      <div style={{ height: 640 }}>
        <div className="inline-flex h-11 items-center rounded-full border border-gray-200 bg-white shadow-sm">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowFileMenu>;

/** On main: "Edit in sandbox", and the canvas with History showing. */
export const OnMain: Story = {};

/** In a sandbox, in code: "Promote to main", with Steps and Settings showing. */
export const InSandboxCode: Story = {
  args: { onMain: false, mode: "code", visibleTrays: ["steps", "inspect"], assistantOpen: true },
};

/** A paused workflow offers "Go live". */
export const Paused: Story = { args: { live: false } };

export const Closed: Story = { args: { defaultOpen: false } };
