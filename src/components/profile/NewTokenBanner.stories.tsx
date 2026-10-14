import type { Meta, StoryObj } from "@storybook/react";
import NewTokenBanner from "./NewTokenBanner";

const meta: Meta<typeof NewTokenBanner> = {
  title: "Profile/NewTokenBanner",
  component: NewTokenBanner,
  args: { token: "demo.fake-token-not-real.AbCdE-12345" },
};
export default meta;
export const Default: StoryObj<typeof NewTokenBanner> = {};
