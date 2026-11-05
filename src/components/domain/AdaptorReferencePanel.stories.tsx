import type { Meta, StoryObj } from "@storybook/react";
import AdaptorReferencePanel from "./AdaptorReferencePanel";
import { adaptorInfo, adaptorSnippets } from "../../fixtures/adaptor-reference";

const meta: Meta<typeof AdaptorReferencePanel> = {
  title: "Domain/AdaptorReferencePanel",
  component: AdaptorReferencePanel,
  decorators: [
    (Story) => (
      <div className="h-[560px] w-[400px] border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { adaptor: adaptorInfo.http, snippets: adaptorSnippets.http },
};

export default meta;
type Story = StoryObj<typeof AdaptorReferencePanel>;

export const ReadOnly: Story = {};

/** With a step open in a sandbox, snippets can be inserted. */
export const Insertable: Story = {
  args: { onInsert: () => {}, stepLabel: "Search for duplicate citizens in Identity" },
};

export const Postgres: Story = { args: { adaptor: adaptorInfo.postgresql, snippets: adaptorSnippets.postgresql } };
