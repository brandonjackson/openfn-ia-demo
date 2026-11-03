import type { Meta, StoryObj } from "@storybook/react";
import XRoadAccessBadge from "./XRoadAccessBadge";
import { xroadStatusSteps } from "../mock-data/xroad";

const meta: Meta<typeof XRoadAccessBadge> = {
  title: "Components/XRoadAccessBadge",
  component: XRoadAccessBadge,
  argTypes: { status: { control: "select", options: xroadStatusSteps.map((s) => s.id) } },
};

export default meta;
type Story = StoryObj<typeof XRoadAccessBadge>;

export const Live: Story = { args: { status: "live" } };

export const AgreementPending: Story = { args: { status: "agreement-pending" } };

export const EveryStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {xroadStatusSteps.map((s) => (
        <XRoadAccessBadge key={s.id} status={s.id} />
      ))}
    </div>
  ),
};
