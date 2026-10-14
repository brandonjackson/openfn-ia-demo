import type { Meta, StoryObj } from "@storybook/react";
import DataclipTypePill from "./DataclipTypePill";

const meta = { title: "History/DataclipTypePill", component: DataclipTypePill } satisfies Meta<typeof DataclipTypePill>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HttpRequest: Story = { args: { type: "http_request" } };
export const StepResult: Story = { args: { type: "step_result" } };
export const Global: Story = { args: { type: "global" } };
export const SavedInput: Story = { args: { type: "saved_input" } };
export const Small: Story = { args: { type: "saved_input", size: "small" } };
