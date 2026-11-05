import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { ComponentProps } from "react";
import EcosystemMap from "./EcosystemMap";
import type { EcosystemSelection } from "../../model/ecosystem-map";
import { ecosystemRoutes, ecosystemStations, ecosystemWorkflows } from "../../fixtures/ecosystem";

/** Lets a story pick things on the map. */
function Interactive(args: ComponentProps<typeof EcosystemMap>) {
  const [selection, setSelection] = useState<EcosystemSelection>(args.selection ?? null);
  return <EcosystemMap {...args} selection={selection} onSelect={setSelection} />;
}

const meta: Meta<typeof EcosystemMap> = {
  title: "Domain/EcosystemMap",
  component: EcosystemMap,
  args: { stations: ecosystemStations, workflows: ecosystemWorkflows, routes: ecosystemRoutes },
  render: (args) => <Interactive {...args} />,
};

export default meta;
type Story = StoryObj<typeof EcosystemMap>;

export const Connections: Story = { args: { mode: "connections" } };

export const Workflows: Story = { args: { mode: "workflows" } };

export const WorkflowSelected: Story = {
  args: { mode: "workflows", selection: { type: "workflow", id: "register-case-workflow" } },
};

export const SystemSelected: Story = {
  args: { mode: "connections", selection: { type: "station", id: "national-id" } },
};

export const LastDay: Story = { args: { mode: "connections", hours: 24 } };
