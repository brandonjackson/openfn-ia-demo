import type { Meta, StoryObj } from "@storybook/react";
import AdaptorPill from "./AdaptorPill";
import { adaptorChoices } from "../../mock-data/adaptor-reference";

const meta: Meta<typeof AdaptorPill> = {
  title: "Workflow/AdaptorPill",
  component: AdaptorPill,
  args: { adaptor: "common" },
};

export default meta;
type Story = StoryObj<typeof AdaptorPill>;

export const Default: Story = {};

export const WithVersion: Story = { args: { adaptor: "http", showVersion: true } };

export const Compact: Story = { args: { adaptor: "http", compact: true } };

export const All: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {adaptorChoices.map((a) => (
        <AdaptorPill key={a} adaptor={a} showVersion />
      ))}
    </div>
  ),
};

/** As a button, as in the code pane header where it opens the step's config. */
export const Clickable: Story = { args: { showVersion: true, compact: true, onClick: () => {} } };
