import type { Meta, StoryObj } from "@storybook/react";
import Button from "../Button";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";

const meta: Meta<typeof InspectorLayout> = {
  title: "Workflow/InspectorLayout",
  component: InspectorLayout,
  decorators: [(Story) => <div className="bg-gray-100 h-[600px] flex justify-end"><Story /></div>],
  args: {
    title: "Path",
    onClose: () => {},
    children: <p>Panel body</p>,
  },
};
export default meta;
type Story = StoryObj<typeof InspectorLayout>;

export const Default: Story = {};
export const WithFooter: Story = {
  args: {
    footer: (
      <InspectorFooter
        leftButtons={<Button theme="secondary">Edit</Button>}
        rightButtons={<Button theme="danger">Delete</Button>}
      />
    ),
  },
};
export const BackButtonFixedHeight: Story = { args: { title: "Run from Transform data", showBackButton: true, fixedHeight: true, bare: true } };
