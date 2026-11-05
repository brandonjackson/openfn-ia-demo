import type { Meta, StoryObj } from "@storybook/react";
import XRoadConnectionDetails from "./XRoadConnectionDetails";
import { withRouter } from "../../stories/decorators";
import { connectedSystems, connectionOf } from "../../fixtures/connected-systems";

const meta: Meta<typeof XRoadConnectionDetails> = {
  title: "Patterns/XRoadConnectionDetails",
  component: XRoadConnectionDetails,
  decorators: [withRouter, (Story) => <div className="max-w-4xl"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof XRoadConnectionDetails>;

const xroadConnection = (id: string) => {
  const c = connectionOf(connectedSystems.find((s) => s.id === id)!);
  if (c.method !== "xroad") throw new Error(`${id} isn't on X-Road`);
  return c;
};

export const Live: Story = { args: { connection: xroadConnection("national-id") } };

export const AgreementPending: Story = { args: { connection: xroadConnection("social-registry") } };
