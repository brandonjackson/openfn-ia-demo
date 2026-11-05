import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "./ActionMenu";

const meta: Meta<typeof ActionMenu> = {
  title: "Primitives/ActionMenu",
  component: ActionMenu,
  parameters: { layout: "centered" },
  args: {
    label: "Actions for DHIS2 Play",
    onSelect: () => {},
    items: [
      { id: "edit", label: "Edit", icon: Pencil },
      { id: "transfer", label: "Transfer", icon: ArrowRightLeft },
      { id: "delete", label: "Delete", icon: Trash2, tone: "danger", divider: true },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

export const Closed: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: 140, paddingLeft: 160 }}>
        <Story />
      </div>
    ),
  ],
};
