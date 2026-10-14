import type { Meta, StoryObj } from "@storybook/react";
import Heading from "./Heading";

const meta: Meta<typeof Heading> = { title: "Shared/Heading", component: Heading, args: { children: "Workflows" } };
export default meta;
type Story = StoryObj<typeof Heading>;

export const ExtraLarge: Story = { args: { size: "xl", as: "h2" } };
export const Large: Story = { args: { size: "lg" } };
export const Medium: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Eyebrow: Story = { args: { size: "eyebrow", children: "Destination URL" } };
