import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../stories/decorators";
import { uuidOf } from "../utils/format";
import UuidChip from "./UuidChip";

const meta = {
  title: "Shared/UuidChip",
  component: UuidChip,
  decorators: [withRouter],
} satisfies Meta<typeof UuidChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = { args: { uuid: uuidOf("wo-1"), to: "/projects/x/history" } };
export const Plain: Story = { args: { uuid: uuidOf("dc-7f3a91") } };
export const Short: Story = { args: { uuid: uuidOf("run-1"), length: 7, to: "/projects/x/runs/run-1" } };
export const Wiped: Story = {
  args: {
    uuid: uuidOf("dc-wiped"),
    disabled: true,
    tooltip: "The input dataclip is unavailable due to this project's data retention policy.",
  },
};
