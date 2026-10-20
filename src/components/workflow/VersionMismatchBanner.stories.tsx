import type { Meta, StoryObj } from "@storybook/react";
import VersionMismatchBanner from "./VersionMismatchBanner";

const meta: Meta<typeof VersionMismatchBanner> = {
  title: "Workflow/VersionMismatchBanner",
  component: VersionMismatchBanner,
  args: { runVersion: "v1", viewingVersion: "v2", onViewAsExecuted: () => {} },
  decorators: [
    (Story) => (
      <div className="w-80 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VersionMismatchBanner>;

export const Default: Story = {};
