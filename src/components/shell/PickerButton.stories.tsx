import type { Meta, StoryObj } from "@storybook/react";
import PickerButton from "./PickerButton";

const meta: Meta<typeof PickerButton> = { title: "Shell/PickerButton", component: PickerButton, args: { label: "openhie-project" } };
export default meta;
type Story = StoryObj<typeof PickerButton>;

export const Project: Story = {};
export const Sandbox: Story = { args: { label: "openhie-project/fhir-mapping-v2", isSandbox: true, color: "#f59e0b" } };
export const DeepSandbox: Story = { args: { label: "openhie-project/fhir/mapping-v2", isSandbox: true, color: "#10b981" } };
