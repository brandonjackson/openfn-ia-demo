import type { Meta, StoryObj } from "@storybook/react";
import FlashAlert from "./FlashAlert";
import { authMessages } from "../../mock-data/auth";

const meta: Meta<typeof FlashAlert> = { title: "Auth/FlashAlert", component: FlashAlert };
export default meta;
type Story = StoryObj<typeof FlashAlert>;

export const Danger: Story = { args: { kind: "danger", children: authMessages.invalidLogin } };
export const Info: Story = { args: { kind: "info", children: authMessages.resetSent } };
export const Warning: Story = { args: { kind: "warning", children: authMessages.resendThrottled } };
