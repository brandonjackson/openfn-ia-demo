import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import UuidChip from "./UuidChip";

const meta = {
  title: "History/UuidChip",
  component: UuidChip,
  decorators: [withRouter],
} satisfies Meta<typeof UuidChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = { args: { id: "wo-1", to: "/projects/x/history" } };
export const Plain: Story = { args: { id: "dc-7f3a91" } };
export const Wiped: Story = {
  args: {
    id: "dc-wiped",
    disabled: true,
    tooltip: "The input dataclip is unavailable due to this project's data retention policy.",
  },
};
