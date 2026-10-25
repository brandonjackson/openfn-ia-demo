import type { Meta, StoryObj } from "@storybook/react";
import SnippetRow from "./SnippetRow";
import { adaptorSnippets } from "../../mock-data/adaptor-reference";

const meta: Meta<typeof SnippetRow> = {
  title: "Workflow/SnippetRow",
  component: SnippetRow,
  decorators: [
    (Story) => (
      <div className="w-96 p-2">
        <Story />
      </div>
    ),
  ],
  args: { snippet: adaptorSnippets.http[0], onInsert: () => {} },
};

export default meta;
type Story = StoryObj<typeof SnippetRow>;

export const Default: Story = {};

export const Expanded: Story = { args: { defaultExpanded: true } };

export const ReadOnly: Story = { args: { onInsert: undefined, defaultExpanded: true } };
