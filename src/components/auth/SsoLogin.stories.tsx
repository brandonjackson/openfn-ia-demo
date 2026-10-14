import type { Meta, StoryObj } from "@storybook/react";
import SsoLogin from "./SsoLogin";
import { exampleSsoProvider } from "../../mock-data/auth";

const meta: Meta<typeof SsoLogin> = {
  title: "Auth/SsoLogin",
  component: SsoLogin,
  decorators: [(Story) => <div className="max-w-md p-6 bg-white grid gap-4">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof SsoLogin>;

export const Default: Story = { args: { provider: exampleSsoProvider } };
