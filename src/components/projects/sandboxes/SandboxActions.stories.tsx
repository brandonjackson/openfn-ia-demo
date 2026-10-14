import type { Meta, StoryObj } from "@storybook/react";
import SandboxActions from "./SandboxActions";
import { sandboxRowsUnder } from "../../../mock-data/sandboxes";
import { projects } from "../../../mock-data/projects";

const rows = sandboxRowsUnder(projects[0].id);

const meta: Meta<typeof SandboxActions> = {
  title: "Projects/Sandboxes/SandboxActions",
  component: SandboxActions,
  args: { sandbox: rows[0] },
};
export default meta;
type Story = StoryObj<typeof SandboxActions>;

export const Default: Story = {};
export const NotAuthorized: Story = { args: { sandbox: { ...rows[0], canEdit: false, canDelete: false, canMerge: false } } };
export const ScheduledForDeletion: Story = { args: { sandbox: rows.find((r) => r.scheduledDeletion)! } };
