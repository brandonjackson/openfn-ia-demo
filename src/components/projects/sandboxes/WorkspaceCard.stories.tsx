import type { Meta, StoryObj } from "@storybook/react";
import WorkspaceCard from "./WorkspaceCard";
import { findSandboxRow, sandboxRowsUnder } from "../../../mock-data/sandboxes";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";

const rows = sandboxRowsUnder(projects[0].id);

const meta: Meta<typeof WorkspaceCard> = {
  title: "Projects/Sandboxes/WorkspaceCard",
  component: WorkspaceCard,
  decorators: [withRouter],
  args: { workspace: findSandboxRow(projects[0].id)!, isRoot: true, isCurrent: true },
};
export default meta;
type Story = StoryObj<typeof WorkspaceCard>;

export const RootProject: Story = {};
export const Sandbox: Story = { args: { workspace: rows[0], isRoot: false, isCurrent: false } };
export const ScheduledForDeletion: Story = {
  args: { workspace: rows.find((r) => r.scheduledDeletion)!, isRoot: false, isCurrent: false },
};
