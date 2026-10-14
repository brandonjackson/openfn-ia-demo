import type { Meta, StoryObj } from "@storybook/react";
import Pill from "./Pill";

const meta: Meta<typeof Pill> = { title: "Shared/Pill", component: Pill, args: { children: "main" } };
export default meta;
type Story = StoryObj<typeof Pill>;

export const Gray: Story = {};
export const Green: Story = { args: { color: "green", children: "Success" } };
export const Red: Story = { args: { color: "red", children: "Failed" } };
export const Orange: Story = { args: { color: "orange", children: "Crashed" } };
export const Yellow: Story = { args: { color: "yellow", children: "Pending" } };
export const Dark: Story = { args: { color: "dark", children: "Lost" } };
export const Square: Story = { args: { color: "primary", square: true, children: "latest" } };
export const Mono: Story = { args: { color: "purple", mono: true, children: "step_result" } };
export const Removable: Story = { args: { color: "blue", children: "openhie-project", onRemove: () => {} } };
