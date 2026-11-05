import type { Meta, StoryObj } from "@storybook/react";
import CopyValue from "./CopyValue";
import { openfnClientId } from "../../fixtures/xroad";

const meta: Meta<typeof CopyValue> = {
  title: "Primitives/CopyValue",
  component: CopyValue,
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof CopyValue>;

export const Default: Story = { args: { value: openfnClientId, label: "Copy subsystem" } };

export const LongUrl: Story = {
  args: { value: "https://app.openfn.org/i/case-surveillance/register-suspected-case/openapi.json", label: "Copy URL" },
};
