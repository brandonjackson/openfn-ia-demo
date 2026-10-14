import type { Meta, StoryObj } from "@storybook/react";
import SecurityPanel from "./SecurityPanel";
import { projects } from "../../mock-data/projects";
import { withRouter, withGrayPanel } from "../../stories/decorators";

const meta: Meta<typeof SecurityPanel> = {
  title: "Project settings/SecurityPanel",
  component: SecurityPanel,
  decorators: [withRouter, withGrayPanel],
  args: { initialRequiresMfa: false, canEditProject: true, canRequireMfa: true },
};
export default meta;
type Story = StoryObj<typeof SecurityPanel>;

export const Optional: Story = {};
export const Required: Story = { args: { initialRequiresMfa: true } };
export const NoPermission: Story = { args: { canEditProject: false, canRequireMfa: false } };
export const Sandbox: Story = { args: { parentProject: projects[0] } };
