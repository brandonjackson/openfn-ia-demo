import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph, snapshotsOf } from "../../mock-data/workflow";
import VersionDropdown from "./VersionDropdown";

const snapshots = snapshotsOf(findWorkflowGraph("wf-openhie")!);

const meta: Meta<typeof VersionDropdown> = {
  title: "Workflow/VersionDropdown",
  component: VersionDropdown,
  args: { snapshots, pinnedVersion: null, onVersionSelect: () => {} },
  decorators: [(Story) => <div className="h-96 p-4"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof VersionDropdown>;

export const Latest: Story = {};
export const PinnedOlderVersion: Story = { args: { pinnedVersion: 10 } };
