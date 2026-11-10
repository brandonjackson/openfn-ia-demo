import type { Meta, StoryObj } from "@storybook/react";
import CountBadge from "./CountBadge";

const meta: Meta<typeof CountBadge> = {
  title: "Primitives/CountBadge",
  component: CountBadge,
  args: { count: 3 },
};

export default meta;
type Story = StoryObj<typeof CountBadge>;

export const Default: Story = {};

/** Inside an amber chip, as on a sandbox with changes. */
export const Amber: Story = { args: { tone: "amber" } };

/** Past 99 it stops counting. */
export const Many: Story = { args: { count: 140 } };
