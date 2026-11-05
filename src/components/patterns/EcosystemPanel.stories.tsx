import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { ComponentProps } from "react";
import EcosystemPanel from "./EcosystemPanel";
import type { EcosystemSelection } from "../../model/ecosystem-map";
import { ecosystemStations, ecosystemWorkflows } from "../../fixtures/ecosystem";
import { withRouter } from "../../stories/decorators";

/** Lets a story move between selections. */
function Interactive(args: ComponentProps<typeof EcosystemPanel>) {
  const [selection, setSelection] = useState<EcosystemSelection>(args.selection);
  return <EcosystemPanel {...args} selection={selection} onSelect={setSelection} />;
}

const meta: Meta<typeof EcosystemPanel> = {
  title: "Patterns/EcosystemPanel",
  component: EcosystemPanel,
  decorators: [withRouter, (Story) => <div className="max-w-xs"><Story /></div>],
  args: {
    stations: ecosystemStations,
    workflows: ecosystemWorkflows,
    hours: 24 * 7,
    systemHref: (id: string) => `/connected-systems/${id}`,
  },
  render: (args) => <Interactive {...args} />,
};

export default meta;
type Story = StoryObj<typeof EcosystemPanel>;

export const Overview: Story = { args: { selection: null } };

export const FailingWorkflow: Story = { args: { selection: { type: "workflow", id: "register-case-workflow" } } };

export const DraftWorkflow: Story = { args: { selection: { type: "workflow", id: "fee-waiver-workflow" } } };

export const XRoadSystem: Story = { args: { selection: { type: "station", id: "national-id" } } };

export const XRoadClient: Story = { args: { selection: { type: "station", id: "ndho" } } };

export const Link: Story = { args: { selection: { type: "link", id: "commcare|dhis2" } } };
