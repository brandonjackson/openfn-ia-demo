import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import LayoutMenu from "./LayoutMenu";
import { defaultLayout } from "../../editor-layout";
import type { EditorLayout } from "../../editor-layout";

function Stateful(args: ComponentProps<typeof LayoutMenu>) {
  const [layout, setLayout] = useState<EditorLayout>(args.layout);
  return (
    <LayoutMenu {...args} layout={layout} onChange={(p) => setLayout((l) => ({ ...l, ...p }))} onReset={() => setLayout(defaultLayout)} />
  );
}

const meta: Meta<typeof LayoutMenu> = {
  title: "Workflow/LayoutMenu",
  component: LayoutMenu,
  decorators: [
    (Story) => (
      <div className="flex h-[480px] justify-end p-4">
        <Story />
      </div>
    ),
  ],
  args: { layout: { ...defaultLayout, panel: true }, view: "code", defaultOpen: true },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof LayoutMenu>;

export const Code: Story = {};
export const Canvas: Story = { args: { view: "canvas" } };
