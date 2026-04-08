import type { Meta, StoryObj } from "@storybook/react";
import ConnectedSystemsSetupSection from "./ConnectedSystemsSetupSection";
import { withRouter } from "../../stories/decorators";
import { connectedSystemSummaries } from "../../mock-data/connected-systems";

const meta: Meta<typeof ConnectedSystemsSetupSection> = {
  title: "Dashboard Sections/ConnectedSystemsSetupSection",
  component: ConnectedSystemsSetupSection,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ConnectedSystemsSetupSection>;

export const Default: Story = {
  args: {
    systems: connectedSystemSummaries,
    recommendedSystems: [
      { name: "OpenMRS", description: "Electronic medical records" },
      { name: "PostgreSQL", description: "Relational database" },
      { name: "WhatsApp Business", description: "Messaging & notifications" },
    ],
    recommended: 10,
  },
};

export const AllConnected: Story = {
  args: {
    systems: connectedSystemSummaries,
    recommendedSystems: [],
    recommended: connectedSystemSummaries.length,
  },
};

export const FewSystems: Story = {
  args: {
    systems: connectedSystemSummaries.slice(0, 2),
    recommendedSystems: [
      { name: "OpenMRS", description: "Electronic medical records" },
      { name: "PostgreSQL", description: "Relational database" },
    ],
    recommended: 10,
  },
};
