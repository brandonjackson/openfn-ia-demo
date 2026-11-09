import type { Meta, StoryObj } from "@storybook/react";
import SandboxChangesMenu from "./SandboxChangesMenu";

const meta: Meta<typeof SandboxChangesMenu> = {
  title: "Domain/SandboxChangesMenu",
  component: SandboxChangesMenu,
  decorators: [
    (Story) => (
      <div className="h-96 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    sandbox: "duplicate-check",
    defaultOpen: true,
    onGoLive: () => {},
    changes: [
      { kind: "added", summary: "Added step Check for a duplicate application" },
      { kind: "changed", summary: "Changed code in Search for duplicate citizens in Identity" },
      { kind: "changed", summary: "Renamed Queue application for retry to Hold for review" },
      { kind: "removed", summary: "Removed step Notify applicant of existing national ID" },
      { kind: "added", summary: "Connected Verify birth registration in OpenCRVS → Check for a duplicate application" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SandboxChangesMenu>;

export const Default: Story = {};

/** Nothing changed yet: no count, and no Go live. */
export const NoChanges: Story = { args: { changes: [] } };

/** Closed, with its count. */
export const Closed: Story = { args: { defaultOpen: false } };

/** Without the right to go live, the list stays and the button goes. */
export const CantGoLive: Story = { args: { onGoLive: undefined } };
