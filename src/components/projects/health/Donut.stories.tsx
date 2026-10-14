import type { Meta, StoryObj } from "@storybook/react";
import Donut from "./Donut";
import { withRouter, withWhitePanel } from "../../../stories/decorators";

const meta: Meta<typeof Donut> = {
  title: "Projects/Health/Donut",
  component: Donut,
  decorators: [withRouter, withWhitePanel()],
  args: {
    slices: [
      { key: "a", label: "Success", color: "#0ca30c", value: 80, href: "/" },
      { key: "b", label: "Failed", color: "#d03b3b", value: 20, href: "/" },
    ],
    emptyMessage: "Nothing to show",
    centre: (total: number) => ({ value: total.toString(), label: "total" }),
  },
};
export default meta;
type Story = StoryObj<typeof Donut>;

export const TwoSlices: Story = {};
export const Empty: Story = { args: { slices: [] } };
