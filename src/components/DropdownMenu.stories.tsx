import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Download, PenLine, Settings, Trash2 } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import Button from "./Button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ height: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ariaLabel: "File",
    defaultOpen: true,
    onSelect: () => {},
    renderTrigger: ({ toggle }) => (
      <Button variant="secondary" size="sm" onClick={toggle}>
        File
      </Button>
    ),
    sections: [
      {
        items: [
          { id: "rename", label: "Rename", icon: PenLine, shortcut: "R" },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "export", label: "Export as YAML", icon: Download },
        ],
      },
      {
        title: "View",
        items: [
          { id: "steps", label: "Steps", checked: true, shortcut: "⌘B" },
          { id: "run", label: "Run output", checked: false, shortcut: "⌘J" },
        ],
      },
      {
        items: [
          { id: "duplicate", label: "Duplicate", icon: Copy, disabled: true, hint: "Not available on main" },
          { id: "delete", label: "Delete", icon: Trash2, tone: "danger" },
        ],
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

/** Sections with icons, shortcuts, ticks, a disabled item and a destructive one. */
export const Default: Story = {};

export const Closed: Story = { args: { defaultOpen: false } };
