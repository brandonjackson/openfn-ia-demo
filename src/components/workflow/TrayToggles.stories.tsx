import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import TrayToggles from "./TrayToggles";
import type { Dock } from "./trays";

const meta: Meta<typeof TrayToggles> = {
  title: "Workflow/TrayToggles",
  component: TrayToggles,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof TrayToggles>;

function Stateful({ initial }: { initial: Record<Dock, boolean> }) {
  const [open, setOpen] = useState(initial);
  return <TrayToggles open={open} onToggle={(d) => setOpen((o) => ({ ...o, [d]: !o[d] }))} />;
}

/** Left open, as on the canvas by default. Click to open or close a dock. */
export const Default: Story = { render: () => <Stateful initial={{ left: true, right: false, bottom: false }} /> };

export const AllOpen: Story = { render: () => <Stateful initial={{ left: true, right: true, bottom: true }} /> };

/** A dock with no trays in it (all moved elsewhere) can't be opened. */
export const EmptyDock: Story = {
  args: { open: { left: true, right: true, bottom: false }, available: { left: true, right: true, bottom: false } },
};
