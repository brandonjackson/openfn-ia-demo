import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DataclipList from "./DataclipList";
import { dataclips } from "../../mock-data/runs";

const named = dataclips.filter((d) => d.name);

function ControlledList(args: ComponentProps<typeof DataclipList>) {
  const [selectedId, setSelectedId] = useState(args.selectedId);
  return <DataclipList {...args} selectedId={selectedId} onSelect={(d) => setSelectedId(d.id)} />;
}

const meta: Meta<typeof DataclipList> = {
  title: "Workflow/DataclipList",
  component: DataclipList,
  parameters: { layout: "padded" },
  args: { dataclips: named },
  render: (args) => <ControlledList {...args} />,
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DataclipList>;

/** Inputs people have named so they can be reused. */
export const Named: Story = {};

export const WithSelection: Story = { args: { selectedId: named[0].id } };

/** Recent inputs, named or not. */
export const Recent: Story = { args: { dataclips: dataclips.slice(0, 6) } };

export const Empty: Story = {
  args: { dataclips: [], emptyMessage: "This project has no named inputs yet." },
};
