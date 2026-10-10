import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Trash2, GitBranch } from "lucide-react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "dark", "outline-primary", "link-danger"],
    },
    size: { control: "select", options: ["xs", "sm", "md"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Save", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Cancel", variant: "secondary" },
};

export const Danger: Story = {
  args: { children: "Delete project", variant: "danger", icon: Trash2 },
};

export const Dark: Story = {
  args: { children: "Connect your GitHub Account", variant: "dark", icon: GitBranch },
};

export const WithIcon: Story = {
  args: { children: "Generate New Token", icon: Plus, size: "sm" },
};

export const Disabled: Story = {
  args: { children: "Add Private Credential", variant: "secondary", size: "sm", disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="dark">Dark</Button>
      <Button variant="outline-primary" size="xs">Request Access</Button>
      <Button variant="link-danger">Remove Collaborator</Button>
    </div>
  ),
};
