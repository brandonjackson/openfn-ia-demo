import type { Meta, StoryObj } from "@storybook/react";
import InstanceMark from "./InstanceMark";
import { currentInstance } from "../../fixtures/user";
import { organizationLogo } from "../../fixtures/organization";

const meta: Meta<typeof InstanceMark> = {
  title: "Domain/InstanceMark",
  component: InstanceMark,
};

export default meta;
type Story = StoryObj<typeof InstanceMark>;

/** Without a logo: the initials. */
export const Default: Story = {
  args: { instance: currentInstance },
};

/** An organisation with a logo: its logo in place of its initials. */
export const WithLogo: Story = {
  args: { instance: { initials: "MH", logo: organizationLogo } },
};
