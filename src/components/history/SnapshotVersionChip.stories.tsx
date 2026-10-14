import type { Meta, StoryObj } from "@storybook/react";
import SnapshotVersionChip from "./SnapshotVersionChip";

const meta = { title: "History/SnapshotVersionChip", component: SnapshotVersionChip } satisfies Meta<
  typeof SnapshotVersionChip
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Latest: Story = {
  args: { version: "latest", tooltip: "This run is based on the latest version of this workflow." },
};
export const Snapshot: Story = { args: { version: "v12" } };
