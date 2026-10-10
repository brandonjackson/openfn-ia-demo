import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import Button from "./Button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: "Export your Project",
    description: "Export your project as code, to save this version or edit your project locally.",
    children: <Button variant="secondary">Export project</Button>,
  },
};

export const ContentOnly: Story = {
  args: {
    children: <p className="text-sm text-gray-700">A card with no heading.</p>,
  },
};

export const Flush: Story = {
  args: {
    flush: true,
    children: <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500">Flush cards have no padding (used to wrap tables).</div>,
  },
};
