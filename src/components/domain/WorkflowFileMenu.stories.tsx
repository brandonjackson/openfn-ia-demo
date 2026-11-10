import type { Meta, StoryObj } from "@storybook/react";
import WorkflowFileMenu from "./WorkflowFileMenu";

const meta: Meta<typeof WorkflowFileMenu> = {
  title: "Domain/WorkflowFileMenu",
  component: WorkflowFileMenu,
  decorators: [
    (Story) => (
      <div className="h-[420px] p-4">
        <div className="inline-flex h-10 rounded-xl border border-gray-200 bg-white shadow-sm">
          <Story />
        </div>
      </div>
    ),
  ],
  args: { onSelect: () => {}, defaultOpen: true, projectName: "Project A" },
};

export default meta;
type Story = StoryObj<typeof WorkflowFileMenu>;

/** On main the workflow is read-only, so the menu offers "Edit in sandbox". */
export const OnMain: Story = {
  args: { onMain: true, url: "https://app.openfn.org/i/abc123", hasDetails: true },
};

/** In a sandbox, renaming is allowed and the menu offers "Go live". */
export const InSandbox: Story = {
  args: { onMain: false, canRename: true },
};

export const Paused: Story = {
  args: { live: false },
};

/** While the workflow loads, the Fn button is there but doesn't open. */
export const Disabled: Story = {
  args: { disabled: true, defaultOpen: false },
};
