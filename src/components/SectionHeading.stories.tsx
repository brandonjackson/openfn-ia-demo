import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Button from "./Button";

const meta: Meta<typeof SectionHeading> = {
  title: "Components/SectionHeading",
  component: SectionHeading,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SectionHeading>;

export const Default: Story = {
  args: {
    title: "Project setup",
    description: "Projects are isolated workspaces that contain workflows, accessible to certain users.",
  },
};

export const TitleOnly: Story = {
  args: { title: "Webhook Security" },
};

export const WithAction: Story = {
  args: {
    title: "API tokens",
    description: "Personal access tokens let you use the OpenFn CLI and API as yourself.",
    action: (
      <Button size="sm" icon={Plus}>
        Generate new token
      </Button>
    ),
  },
};

export const Label: Story = {
  args: { title: "Active", variant: "label" },
};
