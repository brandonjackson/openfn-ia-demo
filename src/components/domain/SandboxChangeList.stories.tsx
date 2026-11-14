import type { Meta, StoryObj } from "@storybook/react";
import SandboxChangeList from "./SandboxChangeList";

const meta: Meta<typeof SandboxChangeList> = {
  title: "Domain/SandboxChangeList",
  component: SandboxChangeList,
  args: {
    changes: [
      { kind: "added", summary: "Added step Check for a duplicate application" },
      { kind: "changed", summary: "Changed code in Search for duplicate citizens in Identity" },
      { kind: "removed", summary: "Removed step Notify applicant of existing national ID" },
      { kind: "added", summary: "Added collection applicants" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SandboxChangeList>;

export const Default: Story = {};
