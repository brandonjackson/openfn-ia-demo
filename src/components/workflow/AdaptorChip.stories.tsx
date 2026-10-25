import type { Meta, StoryObj } from "@storybook/react";
import AdaptorChip from "./AdaptorChip";

const meta: Meta<typeof AdaptorChip> = {
  title: "Workflow/AdaptorChip",
  component: AdaptorChip,
  parameters: { layout: "padded" },
  args: { adaptor: "http" },
};

export default meta;
type Story = StoryObj<typeof AdaptorChip>;

export const Default: Story = {};

/** With the version, as in the step bar. Clicking opens the adaptor's docs. */
export const WithVersion: Story = { args: { adaptor: "postgresql", showVersion: true, onClick: () => {} } };

/** Just the logo, for tight lists such as the steps panel. */
export const IconOnly: Story = { args: { adaptor: "common", iconOnly: true } };
