import type { Meta, StoryObj } from "@storybook/react";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SandboxSettingsBanner> = {
  title: "Project settings/SandboxSettingsBanner",
  component: SandboxSettingsBanner,
  decorators: [withRouter],
  args: { variant: "local" },
};
export default meta;
type Story = StoryObj<typeof SandboxSettingsBanner>;

export const Local: Story = {};
export const Editable: Story = { args: { variant: "editable" } };
export const Inherited: Story = { args: { variant: "inherited", parentProject: projects[0] } };
