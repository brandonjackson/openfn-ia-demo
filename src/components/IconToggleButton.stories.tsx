import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, History, Sparkles } from "lucide-react";
import IconToggleButton from "./IconToggleButton";

const meta: Meta<typeof IconToggleButton> = {
  title: "Components/IconToggleButton",
  component: IconToggleButton,
  args: { icon: History, label: "Run history" },
};

export default meta;
type Story = StoryObj<typeof IconToggleButton>;

export const Default: Story = {};

export const Pressed: Story = {
  args: { pressed: true },
};

export const WithDot: Story = {
  args: { icon: Sparkles, label: "Assistant", hint: "Ctrl/⌘ + K", dot: true },
};

function ToggleGroup() {
  const [open, setOpen] = useState<string | undefined>("assistant");
  const toggle = (id: string) => setOpen((o) => (o === id ? undefined : id));
  return (
    <div className="flex items-center gap-1">
      <IconToggleButton icon={History} label="Run history" pressed={open === "history"} onClick={() => toggle("history")} />
      <IconToggleButton icon={BookOpen} label="Adaptor reference" pressed={open === "docs"} onClick={() => toggle("docs")} />
      <IconToggleButton icon={Sparkles} label="Assistant" pressed={open === "assistant"} onClick={() => toggle("assistant")} />
    </div>
  );
}

/** A row of tray toggles, as in the editor toolbar. */
export const Group: Story = { render: () => <ToggleGroup /> };
