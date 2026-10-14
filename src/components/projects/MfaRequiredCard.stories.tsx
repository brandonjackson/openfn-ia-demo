import type { Meta, StoryObj } from "@storybook/react";
import MfaRequiredCard from "./MfaRequiredCard";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof MfaRequiredCard> = {
  title: "Projects/MfaRequiredCard",
  component: MfaRequiredCard,
  decorators: [withRouter],
};
export default meta;
type Story = StoryObj<typeof MfaRequiredCard>;

export const Default: Story = {};
