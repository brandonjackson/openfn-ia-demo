import type { Meta, StoryObj } from "@storybook/react";
import SuggestedServicesSection from "./SuggestedServicesSection";
import { withRouter } from "../../stories/decorators";
import { overviewData } from "../../mock-data/overview";
import { connectedSystemSummaries } from "../../mock-data/connected-systems";

const meta: Meta<typeof SuggestedServicesSection> = {
  title: "Dashboard Sections/SuggestedServicesSection",
  component: SuggestedServicesSection,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SuggestedServicesSection>;

export const Default: Story = {
  args: {
    services: overviewData.suggestedServices,
    systems: connectedSystemSummaries,
  },
};

export const SingleSuggestion: Story = {
  args: {
    services: overviewData.suggestedServices.slice(0, 1),
    systems: connectedSystemSummaries,
  },
};
