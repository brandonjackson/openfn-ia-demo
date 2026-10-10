import type { Meta, StoryObj } from "@storybook/react";
import FilesPanel from "./FilesPanel";
import { handbookData } from "../mock-data/handbook";

const meta: Meta<typeof FilesPanel> = {
  title: "Components/FilesPanel",
  component: FilesPanel,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: {
    files: handbookData.files,
    capacityBytes: handbookData.capacityBytes,
    description: "Agreements, contacts and reference docs that go with this handbook.",
  },
  argTypes: { onAdd: { action: "added" }, onRemove: { action: "removed" } },
};

export default meta;
type Story = StoryObj<typeof FilesPanel>;

export const Default: Story = {};

export const Empty: Story = { args: { files: [] } };

/** Nearly full: the meter turns red. */
export const NearlyFull: Story = { args: { capacityBytes: 5 * 1024 * 1024 } };

/** Without onAdd/onRemove the panel is read-only. */
export const ReadOnly: Story = { args: { onAdd: undefined, onRemove: undefined } };
