import type { Meta, StoryObj } from "@storybook/react";
import AvatarStack from "./AvatarStack";
import { instanceSettingsData } from "../mock-data/instance";

const names = instanceSettingsData.members.map((m) => m.name);

const meta: Meta<typeof AvatarStack> = {
  title: "Components/AvatarStack",
  component: AvatarStack,
};

export default meta;
type Story = StoryObj<typeof AvatarStack>;

export const Default: Story = {
  args: { names: names.slice(0, 3) },
};

export const WithMore: Story = {
  args: { names: [...names, "Priya Nair", "Kofi Boateng"] },
};

export const One: Story = {
  args: { names: names.slice(0, 1) },
};

export const Empty: Story = {
  args: { names: [] },
};
