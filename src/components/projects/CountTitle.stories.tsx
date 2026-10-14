import type { Meta, StoryObj } from "@storybook/react";
import CountTitle from "./CountTitle";

const meta: Meta<typeof CountTitle> = {
  title: "Projects/CountTitle",
  component: CountTitle,
  args: { title: "Projects", count: 2 },
};
export default meta;
type Story = StoryObj<typeof CountTitle>;

export const WithCount: Story = {};
export const NoCount: Story = { args: { title: "Sandboxes", count: undefined } };
