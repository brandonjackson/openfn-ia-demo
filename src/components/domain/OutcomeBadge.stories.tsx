import type { Meta, StoryObj } from "@storybook/react";
import OutcomeBadge from "./OutcomeBadge";
import Inline from "../primitives/Inline";
import { outcomeStatuses } from "../../model/step-tools";

const meta: Meta<typeof OutcomeBadge> = {
  title: "Domain/OutcomeBadge",
  component: OutcomeBadge,
  args: { status: "success" },
};

export default meta;
type Story = StoryObj<typeof OutcomeBadge>;

export const Success: Story = {};

/** Refused under the rules, though the run itself went fine. */
export const Refused: Story = { args: { status: "refused" } };

/** Every outcome a Report outcome step can record. */
export const AllOutcomes: Story = {
  render: () => (
    <Inline wrap>
      {outcomeStatuses.map((o) => (
        <OutcomeBadge key={o.id} status={o.id} />
      ))}
    </Inline>
  ),
};

/** The square tag, as beside a step's name. */
export const Tags: Story = {
  render: () => (
    <Inline wrap>
      {outcomeStatuses.map((o) => (
        <OutcomeBadge key={o.id} status={o.id} shape="tag" />
      ))}
    </Inline>
  ),
};
