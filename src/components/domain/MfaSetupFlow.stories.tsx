import type { Meta, StoryObj } from "@storybook/react";
import MfaSetupFlow from "./MfaSetupFlow";
import { demoMfaSetup } from "../../fixtures/user";

const meta: Meta<typeof MfaSetupFlow> = {
  title: "Domain/MfaSetupFlow",
  component: MfaSetupFlow,
  parameters: { layout: "padded" },
  args: { setup: demoMfaSetup, onVerify: async () => {}, onCancel: () => {} },
};

export default meta;
type Story = StoryObj<typeof MfaSetupFlow>;

export const Default: Story = {};

/** The server didn't accept the code. */
export const WrongCode: Story = {
  args: {
    onVerify: async () => {
      throw new Error("Invalid code");
    },
  },
};
