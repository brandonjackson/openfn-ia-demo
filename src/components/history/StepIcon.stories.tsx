import type { Meta, StoryObj } from "@storybook/react";
import StepIcon from "./StepIcon";

const meta = { title: "History/StepIcon", component: StepIcon } satisfies Meta<typeof StepIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { reason: "success" } };
export const Fail: Story = { args: { reason: "fail" } };
export const Crash: Story = { args: { reason: "crash" } };
export const Pending: Story = { args: { reason: null } };
