import type { Meta, StoryObj } from "@storybook/react";
import XRoadStatusTrack from "./XRoadStatusTrack";
import { connectedSystems, connectionOf } from "../../fixtures/connected-systems";

const meta: Meta<typeof XRoadStatusTrack> = {
  title: "Domain/XRoadStatusTrack",
  component: XRoadStatusTrack,
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof XRoadStatusTrack>;

const historyOf = (id: string) => {
  const c = connectionOf(connectedSystems.find((s) => s.id === id)!);
  return c.method === "xroad" ? { status: c.status, history: c.history } : { status: "discovered" as const };
};

export const Live: Story = { args: historyOf("openmrs") };

export const AgreementPending: Story = { args: historyOf("social-registry") };

export const JustDiscovered: Story = { args: { status: "discovered", history: [{ status: "discovered", date: "3 Nov 2026" }] } };
