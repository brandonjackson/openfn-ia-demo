import type { Meta, StoryObj } from "@storybook/react";
import { Folder, Sparkles, Workflow } from "lucide-react";
import IconTile from "./IconTile";

const meta: Meta<typeof IconTile> = {
  title: "Primitives/IconTile",
  component: IconTile,
  args: { icon: Folder },
};

export default meta;
type Story = StoryObj<typeof IconTile>;

export const Default: Story = {};

export const Indigo: Story = { args: { icon: Sparkles, tone: "indigo" } };

export const White: Story = { args: { icon: Workflow, tone: "white", size: "sm" } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconTile icon={Folder} size="2xs" />
      <IconTile icon={Folder} size="xs" />
      <IconTile icon={Folder} size="sm" />
      <IconTile icon={Folder} size="md" />
      <IconTile icon={Folder} size="lg" />
    </div>
  ),
};

/** Letters standing in for a missing logo. */
export const Letters: Story = { args: { icon: undefined, tone: "dark", children: "ab" } };

export const Round: Story = { args: { icon: Workflow, tone: "white", size: "2xs", round: true } };
