import type { Meta, StoryObj } from "@storybook/react";
import { Folder, Plus } from "lucide-react";
import MenuButton from "./MenuButton";
import { componentTypes } from "../component-types";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof MenuButton> = {
  title: "Components/MenuButton",
  component: MenuButton,
  decorators: [
    (Story) => (
      <div className="h-96">
        <Story />
      </div>
    ),
  ],
  args: { onSelect: () => {} },
};

export default meta;
type Story = StoryObj<typeof MenuButton>;

export const Button: Story = {
  args: {
    label: "New Component",
    icon: Plus,
    items: componentTypes
      .filter((t) => t.type !== "Workflow")
      .map((t) => ({ id: t.type, label: t.type, description: t.description, icon: t.icon })),
  },
};

export const ButtonOpen: Story = {
  args: { ...Button.args, defaultOpen: true },
};

export const Link: Story = {
  args: {
    appearance: "link",
    label: "Create a workflow here",
    menuTitle: "Start the workflow in…",
    items: projects.map((p) => ({ id: p.id, label: p.name, icon: Folder })),
    defaultOpen: true,
  },
};
