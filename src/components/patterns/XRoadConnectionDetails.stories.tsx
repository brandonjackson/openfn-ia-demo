import type { Meta, StoryObj } from "@storybook/react";
import XRoadConnectionDetails from "./XRoadConnectionDetails";
import { withRouter } from "../../stories/decorators";
import { connectionOf } from "../../model/connected-systems";
import { connectedSystems } from "../../fixtures/connected-systems";
import { directoryMember, orgXRoad, routeService } from "../../fixtures/xroad";

const meta: Meta<typeof XRoadConnectionDetails> = {
  title: "Patterns/XRoadConnectionDetails",
  component: XRoadConnectionDetails,
  decorators: [withRouter, (Story) => <div className="max-w-4xl"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof XRoadConnectionDetails>;

const xroadArgs = (id: string) => {
  const c = connectionOf(connectedSystems.find((s) => s.id === id)!);
  if (c.method !== "xroad") throw new Error(`${id} isn't on X-Road`);
  return { connection: c, org: orgXRoad, member: directoryMember(c.route.memberId), service: routeService(c.route) };
};

export const Live: Story = { args: xroadArgs("national-id") };

export const AgreementPending: Story = { args: xroadArgs("social-registry") };
