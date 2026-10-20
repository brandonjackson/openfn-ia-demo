import type { Meta, StoryObj } from "@storybook/react";
import SuggestedSystemsToAdd from "./SuggestedSystemsToAdd";

const meta: Meta<typeof SuggestedSystemsToAdd> = {
  title: "Components/SuggestedSystemsToAdd",
  component: SuggestedSystemsToAdd,
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
      { name: "DHIS2", description: "Health information management" },
      { name: "Salesforce", description: "CRM platform" },
    ],
  },
};

export const SingleSuggestion: Story = {
  args: {
    suggestions: [
      { name: "PostgreSQL", description: "Relational database" },
    ],
  },
};

/** Compact dashed chips, as used on the Overview page. */
export const Inline: Story = {
  args: { variant: "inline" },
  decorators: [(Story) => <div className="flex flex-wrap gap-1.5"><Story /></div>],
};
