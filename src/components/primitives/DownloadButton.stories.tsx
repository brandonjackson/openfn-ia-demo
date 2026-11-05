import type { Meta, StoryObj } from "@storybook/react";
import DownloadButton from "./DownloadButton";

const meta: Meta<typeof DownloadButton> = {
  title: "Primitives/DownloadButton",
  component: DownloadButton,
  args: {
    fileName: "project-a.yaml",
    content: "name: project-a\nworkflows: {}\n",
    mimeType: "application/yaml",
    children: "Download",
  },
};

export default meta;
type Story = StoryObj<typeof DownloadButton>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: "secondary", size: "sm" } };
