import type { Meta, StoryObj } from "@storybook/react";
import SettingsCard from "./SettingsCard";
import Button from "../Button";

const meta: Meta<typeof SettingsCard> = {
  title: "Project settings/SettingsCard",
  component: SettingsCard,
  args: {
    title: "Export your Project",
    description: "Export your project as code, to save this version or edit your project locally.",
    children: <Button>Export project</Button>,
  },
};
export default meta;
type Story = StoryObj<typeof SettingsCard>;

export const Default: Story = {};
export const TextOnly: Story = {
  args: {
    title: "Sync to GitHub",
    description:
      "Version Control is not configured for this Lightning instance. Contact the superuser for more information.",
    children: undefined,
  },
};
