import type { Meta, StoryObj } from "@storybook/react";
import InstanceLogo from "./InstanceLogo";
import { withRouter } from "../../stories/decorators";
import { currentInstance } from "../../fixtures/user";
import { organizationLogo } from "../../fixtures/organization";

const meta: Meta<typeof InstanceLogo> = {
  title: "Domain/InstanceLogo",
  component: InstanceLogo,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof InstanceLogo>;

export const Default: Story = {
  args: { instance: currentInstance },
};

/** Without the organization layer, home is the projects list. */
export const HomeIsProjects: Story = {
  args: { instance: currentInstance, title: "Back to projects" },
};

/** An organisation with a logo: its logo in place of its initials. */
export const WithLogo: Story = {
  args: { instance: { name: "Ministry of Health", initials: "MH", logo: organizationLogo } },
};

/** An organisation without a logo: its initials. */
export const Organization: Story = {
  args: { instance: { name: "Ministry of Health", initials: "MH" } },
};
