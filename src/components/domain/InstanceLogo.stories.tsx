import type { Meta, StoryObj } from "@storybook/react";
import InstanceLogo from "./InstanceLogo";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof InstanceLogo> = {
  title: "Domain/InstanceLogo",
  component: InstanceLogo,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof InstanceLogo>;

export const Default: Story = {};
