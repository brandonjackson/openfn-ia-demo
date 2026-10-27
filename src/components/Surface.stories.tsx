import type { Meta, StoryObj } from "@storybook/react";
import Surface from "./Surface";

const meta: Meta<typeof Surface> = {
  title: "Components/Surface",
  component: Surface,
  args: { className: "p-4 text-sm text-gray-700", children: "A white, bordered, shadowed frame." },
  decorators: [(Story) => <div className="bg-gray-50 p-8">{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof Surface>;

/** Toolbar groups, the runs bar, a node card. */
export const Raised: Story = {};

/** The inspector, the runs list, a floating tray. */
export const Floating: Story = { args: { variant: "floating", as: "section" } };

/** A menu or picker opened from a trigger. */
export const Popover: Story = { args: { variant: "popover", className: "w-60 p-1.5 text-sm text-gray-700" } };

/** A bar over the canvas, as the runs bar draws it. */
export const Bar: Story = {
  args: { className: "inline-flex h-10 items-center gap-2 px-3 text-xs text-gray-600", children: "Runs · 24h · 128 runs" },
};
