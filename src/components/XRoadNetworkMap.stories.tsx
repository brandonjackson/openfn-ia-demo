import type { Meta, StoryObj } from "@storybook/react";
import XRoadNetworkMap from "./XRoadNetworkMap";
import { networkMembers, orgXRoad } from "../mock-data/xroad";

const meta: Meta<typeof XRoadNetworkMap> = {
  title: "Components/XRoadNetworkMap",
  component: XRoadNetworkMap,
  args: { centre: { name: orgXRoad.memberName, code: orgXRoad.memberCode }, members: networkMembers },
};

export default meta;
type Story = StoryObj<typeof XRoadNetworkMap>;

export const Full: Story = {
  args: { variant: "full" },
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
};

export const Mini: Story = {
  args: { variant: "mini", onExpand: () => {} },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export const NothingConnectedYet: Story = {
  args: { variant: "full", members: networkMembers.map((m) => ({ ...m, linked: false, direction: undefined })) },
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
};
