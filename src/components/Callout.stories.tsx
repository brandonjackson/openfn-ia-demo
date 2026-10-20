import type { Meta, StoryObj } from "@storybook/react";
import { Trash2 } from "lucide-react";
import Callout from "./Callout";
import Button from "./Button";

const meta: Meta<typeof Callout> = {
  title: "Components/Callout",
  component: Callout,
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "select", options: ["info", "warning", "danger", "success"] },
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Info: Story = {
  args: {
    variant: "info",
    title: "Org credentials live in Systems",
    children: "Credentials shared with your organization are managed from each connected system.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Deprecation Notice",
    children: "Webhook security settings have moved to your personal vault.",
  },
};

export const DangerZone: Story = {
  args: {
    variant: "danger",
    title: "The danger zone",
    children: (
      <>
        <p>Deleting your project is irreversible.</p>
        <Button variant="danger" icon={Trash2}>
          Delete project
        </Button>
      </>
    ),
  },
};

export const Success: Story = {
  args: { variant: "success", title: "GitHub account connected" },
};
