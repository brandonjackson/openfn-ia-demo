import type { Meta, StoryObj } from "@storybook/react";
import FileDropzone from "./FileDropzone";

const meta: Meta<typeof FileDropzone> = {
  title: "Components/FileDropzone",
  component: FileDropzone,
  parameters: { layout: "padded" },
  argTypes: { onFiles: { action: "files" } },
};

export default meta;
type Story = StoryObj<typeof FileDropzone>;

export const Default: Story = {
  args: { description: "PDF, DOCX, XLSX, CSV, TXT, MD or images" },
};

/** Slimmer version shown above an existing file list. */
export const Compact: Story = {
  args: { compact: true, title: "Drop files to add them" },
};
