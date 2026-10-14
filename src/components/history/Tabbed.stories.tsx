import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import Tabbed from "./Tabbed";

const meta = { title: "History/Tabbed", component: Tabbed } satisfies Meta<typeof Tabbed>;
export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  {
    id: "log",
    label: (
      <>
        <span className="hero-command-line h-5 w-5 inline-block mr-1 align-middle" />
        <span className="inline-block align-middle">Log</span>
      </>
    ),
  },
  {
    id: "input",
    label: (
      <>
        <span className="hero-arrow-down-on-square h-5 w-5 inline-block mr-1 align-middle" />
        <span className="inline-block align-middle">Input</span>
      </>
    ),
    disabled: true,
    disabledMsg: "A valid step must be selected to view its input",
  },
];

function Demo(args: ComponentProps<typeof Tabbed>) {
  const [active, setActive] = useState(args.active);
  return (
    <Tabbed {...args} active={active} onChange={setActive}>
      <div className="p-4 text-sm">Panel: {active}</div>
    </Tabbed>
  );
}

export const Default: Story = {
  args: { tabs, active: "log", onChange: () => {}, children: null },
  render: (args) => <Demo {...args} />,
};
