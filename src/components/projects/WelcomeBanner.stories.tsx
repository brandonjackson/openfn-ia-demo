import type { Meta, StoryObj } from "@storybook/react";
import WelcomeBanner from "./WelcomeBanner";

const meta: Meta<typeof WelcomeBanner> = {
  title: "Projects/WelcomeBanner",
  component: WelcomeBanner,
  args: { firstName: "Amy", hour: 19, animate: false },
};
export default meta;
type Story = StoryObj<typeof WelcomeBanner>;

export const Evening: Story = {};
export const Morning: Story = { args: { hour: 9 } };
export const LateNight: Story = { args: { hour: 23 } };
export const Typing: Story = { args: { animate: true } };
