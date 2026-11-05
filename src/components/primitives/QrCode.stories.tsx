import type { Meta, StoryObj } from "@storybook/react";
import QrCode from "./QrCode";

const meta: Meta<typeof QrCode> = {
  title: "Primitives/QrCode",
  component: QrCode,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof QrCode>;

export const Default: Story = {
  args: {
    value: "otpauth://totp/OpenFn:jane.doe@example.org?secret=DEMOSECRETDEMOSECRET&issuer=OpenFn",
    label: "QR code for your authenticator app",
  },
};

/** Another value draws another pattern. */
export const OtherValue: Story = {
  args: { ...Default.args, value: "otpauth://totp/OpenFn:demo?secret=ANOTHERDEMOSECRET", size: 120 },
};
