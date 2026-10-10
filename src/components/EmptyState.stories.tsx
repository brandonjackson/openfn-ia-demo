import type { Meta, StoryObj } from "@storybook/react";
import { Download, Fingerprint } from "lucide-react";
import EmptyState from "./EmptyState";
import Button from "./Button";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: Download,
    title: "No exports yet.",
    description: "Export your work order history to download it as a file.",
    action: <Button>Create Export</Button>,
  },
};

export const NoAction: Story = {
  args: {
    icon: Fingerprint,
    title: "No personal access tokens",
    description: "Get started by creating a new access token.",
  },
};
