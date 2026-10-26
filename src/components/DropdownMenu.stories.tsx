import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown, Download, FlaskConical, Maximize2, Pause, Pencil, Play, Settings, Sparkles, Trash2 } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import Button from "./Button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  decorators: [
    (Story) => (
      <div className="h-80 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    ariaLabel: "Workflow menu",
    onSelect: () => {},
    trigger: ({ open, toggle }) => (
      <Button variant="secondary" size="sm" onClick={toggle} aria-expanded={open} aria-haspopup="menu">
        Workflow <ChevronDown size={14} />
      </Button>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    defaultOpen: true,
    items: [
      { id: "rename", label: "Rename", icon: Pencil, shortcut: "R" },
      { id: "settings", label: "Settings", icon: Settings },
      { id: "sandbox", label: "Edit in sandbox", icon: FlaskConical },
      { id: "export", label: "Export as YAML", icon: Download },
      { id: "pause", label: "Pause workflow", icon: Pause, divider: true },
      { id: "delete", label: "Delete workflow", icon: Trash2, tone: "danger" },
    ],
  },
};

/** Turning things on and off: each item carries a checkbox. */
export const WithCheckboxes: Story = {
  args: {
    defaultOpen: true,
    title: "Show",
    items: [
      { id: "explorer", label: "Explorer", checked: true },
      { id: "panel", label: "Panel", checked: false },
      { id: "details", label: "Details", checked: true },
      { id: "reset", label: "Reset layout", divider: true },
    ],
  },
};

/** Picking one of several: the current choice carries a check mark. */
export const WithSelection: Story = {
  args: {
    defaultOpen: true,
    title: "Sandboxes",
    items: [
      { id: "main", label: "main", tag: "Live", selected: true },
      { id: "intake", label: "intake-validation-v2", description: "You, 2 hours ago" },
      { id: "sync", label: "decision-sync-fix", description: "Amara Okafor, yesterday" },
      { id: "new", label: "New sandbox…", icon: FlaskConical, divider: true },
    ],
  },
};

/** Opened to the right of its trigger, level with its top, as from a canvas card's ⋮. */
export const Beside: Story = {
  args: {
    placement: "beside",
    widthClass: "w-48",
    defaultOpen: true,
    items: [
      { id: "run", label: "Run from here", icon: Play },
      { id: "edit", label: "Edit", icon: Maximize2 },
      { id: "improve", label: "Improve", icon: Sparkles },
      { id: "delete", label: "Delete", icon: Trash2, tone: "danger" },
    ],
  },
};
