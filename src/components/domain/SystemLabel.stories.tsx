import type { Meta, StoryObj } from "@storybook/react";
import SystemLabel from "./SystemLabel";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SystemLabel> = {
  title: "Domain/SystemLabel",
  component: SystemLabel,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof SystemLabel>;

export const Default: Story = {
  args: { name: "DHIS2" },
};

export const AsLink: Story = {
  args: { name: "CommCare", to: "/connected-systems/commcare" },
};
