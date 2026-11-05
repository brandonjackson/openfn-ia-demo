import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import XRoadDirectory from "./XRoadDirectory";
import { routeKey } from "../../model/xroad";
import { xroadDirectory } from "../../fixtures/xroad";
import type { XRoadRoute } from "../../model/xroad";

const meta: Meta<typeof XRoadDirectory> = {
  title: "Patterns/XRoadDirectory",
  component: XRoadDirectory,
  args: { members: xroadDirectory, syncedAt: "12 minutes ago" },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof XRoadDirectory>;

export const Default: Story = {
  args: { added: ["nrh/OPENMRS/patients", "moi/IDENTITY/verify-national-id"] },
};

function AddingDemo(args: Parameters<typeof XRoadDirectory>[0]) {
  const [added, setAdded] = useState<string[]>([]);
  return <XRoadDirectory {...args} added={added} onAdd={(r: XRoadRoute) => setAdded((a) => [...a, routeKey(r)])} />;
}

/** Add marks a service as added, as it joins your systems. */
export const AddingServices: Story = { render: (args) => <AddingDemo {...args} /> };
