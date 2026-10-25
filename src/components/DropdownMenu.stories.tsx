import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown, Download, FlaskConical, Pause, Pencil, Settings, Trash2 } from "lucide-react";
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
