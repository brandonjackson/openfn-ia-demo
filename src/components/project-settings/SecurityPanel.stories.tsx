import type { Meta, StoryObj } from "@storybook/react";
import SecurityPanel from "./SecurityPanel";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SecurityPanel> = {
  title: "Project settings/SecurityPanel",
  component: SecurityPanel,
  decorators: [withRouter, (Story) => <div className="space-y-4 bg-gray-100 p-6"><Story /></div>],
  args: { initialRequiresMfa: false, canEditProject: true, canRequireMfa: true },
};
export default meta;
type Story = StoryObj<typeof SecurityPanel>;

export const Optional: Story = {};
export const Required: Story = { args: { initialRequiresMfa: true } };
export const NoPermission: Story = { args: { canEditProject: false, canRequireMfa: false } };
export const Sandbox: Story = { args: { parentProject: projects[0] } };
