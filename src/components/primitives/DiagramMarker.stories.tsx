import type { Meta, StoryObj } from "@storybook/react";
import { Check, Code } from "lucide-react";
import DiagramMarker from "./DiagramMarker";

const meta: Meta<typeof DiagramMarker> = {
  title: "Primitives/DiagramMarker",
  component: DiagramMarker,
  parameters: { layout: "centered" },
  args: { icon: Check, title: "On success" },
};

export default meta;
type Story = StoryObj<typeof DiagramMarker>;

export const Default: Story = {};
export const WithLabel: Story = { args: { icon: Code, title: "On match", label: "Exact match", detail: "state.exactMatch === true" } };
export const LongLabel: Story = { args: { label: "A label much longer than the tab has room for" } };
export const Inactive: Story = { args: { label: "Off", inactive: true } };
export const Selected: Story = { args: { selected: true, onClick: () => {} } };
export const Clickable: Story = { args: { label: "Pick me", onClick: () => {} } };
