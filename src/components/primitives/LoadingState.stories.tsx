import type { Meta, StoryObj } from "@storybook/react";
import LoadingState from "./LoadingState";

const meta: Meta<typeof LoadingState> = {
  title: "Primitives/LoadingState",
  component: LoadingState,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

/** A page's data on its way, in place of the page. */
export const Page: Story = { args: { label: "Loading project…" } };

/** Inside a section or a row. */
export const Inline: Story = { args: { label: "Loading members…", size: "inline" } };
