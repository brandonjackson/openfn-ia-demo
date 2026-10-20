import type { Meta, StoryObj } from "@storybook/react";
import SuggestedSystemsToAdd from "./SuggestedSystemsToAdd";
import { withRouter } from "../stories/decorators";
import { recommendedSystems } from "../mock-data/connected-systems";

const meta: Meta<typeof SuggestedSystemsToAdd> = {
  title: "Components/SuggestedSystemsToAdd",
  component: SuggestedSystemsToAdd,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof SuggestedSystemsToAdd>;

export const Default: Story = {
  args: {},
  name: "Default suggestions",
};

export const CustomSuggestions: Story = {
  args: {
    suggestions: [
      { name: "DHIS2", description: "Health information management", adaptor: "dhis2" },
      { name: "Salesforce", description: "CRM platform", adaptor: "salesforce" },
    ],
  },
};

export const SingleSuggestion: Story = {
  args: {
    suggestions: [
      { name: "PostgreSQL", description: "Relational database", adaptor: "postgresql" },
    ],
  },
};

/** Compact dashed pills, as used on the Overview page. */
export const Inline: Story = {
  args: { variant: "inline", suggestions: recommendedSystems },
  decorators: [(Story) => <div className="flex flex-wrap gap-2"><Story /></div>],
};
