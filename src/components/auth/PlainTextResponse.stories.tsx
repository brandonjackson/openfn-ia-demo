import type { Meta, StoryObj } from "@storybook/react";
import PlainTextResponse from "./PlainTextResponse";
import { signupDisabledMessage } from "../../mock-data/auth";

const meta: Meta<typeof PlainTextResponse> = { title: "Auth/PlainTextResponse", component: PlainTextResponse };
export default meta;
type Story = StoryObj<typeof PlainTextResponse>;

export const SignupDisabled: Story = { args: { children: signupDisabledMessage } };
