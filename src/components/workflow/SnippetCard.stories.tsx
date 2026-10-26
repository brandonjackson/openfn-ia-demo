import type { Meta, StoryObj } from "@storybook/react";
import SnippetCard from "./SnippetCard";
import { adaptorSnippets } from "../../mock-data/adaptor-reference";

const meta: Meta<typeof SnippetCard> = {
  title: "Workflow/SnippetCard",
  component: SnippetCard,
  decorators: [
    (Story) => (
      <div className="w-80 p-2">
        <Story />
      </div>
    ),
  ],
  args: { snippet: adaptorSnippets.http[0], onInsert: () => {} },
};

export default meta;
type Story = StoryObj<typeof SnippetCard>;

export const Insertable: Story = {};

/** On main, or with nothing editable open: just the reference. */
export const ReadOnly: Story = { args: { onInsert: undefined } };
