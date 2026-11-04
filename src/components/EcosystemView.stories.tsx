import type { Meta, StoryObj } from "@storybook/react";
import EcosystemView from "./EcosystemView";
import { ecosystemRoutes, ecosystemStations, ecosystemWorkflows } from "../mock-data/ecosystem";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof EcosystemView> = {
  title: "Components/EcosystemView",
  component: EcosystemView,
  decorators: [withRouter],
  args: {
    stations: ecosystemStations,
    workflows: ecosystemWorkflows,
    routes: ecosystemRoutes,
    systemHref: (id: string) => `/connected-systems/${id}`,
  },
};

export default meta;
type Story = StoryObj<typeof EcosystemView>;

export const Default: Story = {};

export const ByWorkflow: Story = { args: { initialMode: "workflows" } };

export const WorkflowPicked: Story = {
  args: { initialMode: "workflows", initialSelection: { type: "workflow", id: "client-dedup-workflow" } },
};
