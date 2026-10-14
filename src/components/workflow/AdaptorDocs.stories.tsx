import type { Meta, StoryObj } from "@storybook/react";
import AdaptorDocs, { AdaptorMetadata } from "./AdaptorDocs";

const meta: Meta<typeof AdaptorDocs> = {
  title: "Workflow/AdaptorDocs",
  component: AdaptorDocs,
  decorators: [(Story) => <div className="w-[480px] p-2"><Story /></div>],
  args: { adaptor: "@openfn/language-http@latest" },
};
export default meta;
type Story = StoryObj<typeof AdaptorDocs>;

export const Http: Story = {};
export const Common: Story = { args: { adaptor: "@openfn/language-common@latest" } };
export const Metadata: Story = { render: () => <AdaptorMetadata adaptor="@openfn/language-http@latest" /> };
