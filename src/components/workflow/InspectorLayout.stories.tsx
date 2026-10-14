import type { Meta, StoryObj } from "@storybook/react";
import EditorButton from "./EditorButton";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";

const meta: Meta<typeof InspectorLayout> = {
  title: "Workflow/InspectorLayout",
  component: InspectorLayout,
  decorators: [(Story) => <div className="bg-gray-100 h-[600px] flex justify-end"><Story /></div>],
  args: {
    title: "Path",
    onClose: () => {},
    children: <p className="p-6 text-sm text-gray-600">Panel body</p>,
  },
};
export default meta;
type Story = StoryObj<typeof InspectorLayout>;

export const Default: Story = {};
export const WithFooter: Story = {
  args: {
    footer: (
      <InspectorFooter
        leftButtons={<EditorButton variant="secondary">Edit</EditorButton>}
        rightButtons={<EditorButton variant="danger">Delete</EditorButton>}
      />
    ),
  },
};
export const BackButtonFixedHeight: Story = { args: { title: "Run from Transform data", showBackButton: true, fixedHeight: true } };
