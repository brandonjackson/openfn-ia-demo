import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import Button from "./Button";

const meta: Meta<typeof Card> = {
  title: "Shared/Card",
  component: Card,
  args: { children: "The webhook URL is shown once the trigger is saved." },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const WithHeader: Story = {
  args: {
    title: "Project Identity",
    description: "Project name and description.",
    action: <Button theme="secondary">Edit</Button>,
  },
};
export const Large: Story = { args: { padding: "lg" } };
export const Muted: Story = { args: { muted: true } };
export const Dashed: Story = { args: { dashed: true, className: "text-center text-sm text-gray-500", children: "Drop a file here" } };
export const Clickable: Story = { args: { as: "button", onClick: () => {}, children: "Start from a template" } };
