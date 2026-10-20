import type { Meta, StoryObj } from "@storybook/react";
import ConnectedSystemsSetupSection from "./ConnectedSystemsSetupSection";
import { withRouter } from "../../stories/decorators";
import { connectedSystemSummaries, recommendedSystems } from "../../mock-data/connected-systems";

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
    recommendedSystems,
    recommended: connectedSystemSummaries.length + recommendedSystems.length,
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
    recommendedSystems: recommendedSystems.slice(0, 3),
    recommended: 10,
  },
};
