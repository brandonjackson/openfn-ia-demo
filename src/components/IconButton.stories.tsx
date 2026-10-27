import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, Copy, History, Maximize2, MoreVertical, Plus, Sparkles, X } from "lucide-react";
import IconButton from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  args: { icon: X, label: "Close" },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton size="2xs" icon={X} label="Remove" />
      <IconButton size="xs" icon={Copy} label="Copy URL" />
      <IconButton size="sm" icon={Maximize2} label="Maximise panel" />
      <IconButton size="md" icon={X} label="Close" />
    </div>
  ),
};

/** Holding the hover look while its menu is open. */
export const Active: Story = {
  args: { icon: MoreVertical, label: "More actions", active: true },
};

/** The brand colour for "something is attached". */
export const AccentActive: Story = {
  args: { icon: Plus, label: "Attach run logs or data", active: true, tone: "accent" },
};

export const Disabled: Story = {
  args: { icon: Plus, label: "Add a step", disabled: true },
};

export const Toggle: Story = {
  args: { variant: "toggle", size: "md", icon: History, label: "Run history" },
};

export const TogglePressed: Story = {
  args: { variant: "toggle", size: "md", icon: History, label: "Run history", pressed: true },
};

export const WithDot: Story = {
  args: { variant: "toggle", size: "md", icon: Sparkles, label: "Assistant", hint: "Ctrl/⌘ + K", dot: true },
};

function ToggleGroup() {
  const [open, setOpen] = useState<string | undefined>("assistant");
  const toggle = (id: string) => setOpen((o) => (o === id ? undefined : id));
  return (
    <div className="flex items-center gap-1">
      <IconButton variant="toggle" size="md" icon={History} label="Run history" pressed={open === "history"} onClick={() => toggle("history")} />
      <IconButton variant="toggle" size="md" icon={BookOpen} label="Adaptor reference" pressed={open === "docs"} onClick={() => toggle("docs")} />
      <IconButton variant="toggle" size="md" icon={Sparkles} label="Assistant" pressed={open === "assistant"} onClick={() => toggle("assistant")} />
    </div>
  );
}

/** A row of toggles, as in the editor toolbar. */
export const ToggleRow: Story = { render: () => <ToggleGroup /> };
