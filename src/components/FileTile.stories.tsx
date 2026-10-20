import type { Meta, StoryObj } from "@storybook/react";
import FileTile from "./FileTile";
import { handbookFiles } from "../mock-data/handbook";

const [pdf, , sheet, text, image] = handbookFiles;

const meta: Meta<typeof FileTile> = {
  title: "Components/FileTile",
  component: FileTile,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-44"><Story /></div>],
  args: { name: pdf.name, kind: pdf.kind, size: pdf.size, detail: `Added by ${pdf.addedBy}, ${pdf.addedAt}` },
  argTypes: { onRemove: { action: "removed" } },
};

export default meta;
type Story = StoryObj<typeof FileTile>;

export const Pdf: Story = {};

export const Spreadsheet: Story = { args: { name: sheet.name, kind: sheet.kind, size: sheet.size } };

export const TextFile: Story = { args: { name: text.name, kind: text.kind, size: text.size } };

export const Image: Story = { args: { name: image.name, kind: image.kind, size: image.size } };

/** Without onRemove there is no remove button. */
export const ReadOnly: Story = { args: { onRemove: undefined } };

export const LongName: Story = {
  args: { name: "Malawi Ministry of Health and Registrar General joint data sharing agreement (signed, final v3).pdf" },
};
