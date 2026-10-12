import type { Meta, StoryObj } from "@storybook/react";
import { Folder, Plus } from "lucide-react";
import DropdownMenu, { DropdownMenuDivider, DropdownMenuHeading, DropdownMenuItem } from "./DropdownMenu";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  decorators: [
    withRouter,
    (Story) => (
      <div className="h-72 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Open: Story = {
  args: {
    label: "Choose a fruit",
    trigger: <span>Apples</span>,
    defaultOpen: true,
    children: (close) => (
      <>
        <DropdownMenuHeading>Fruit</DropdownMenuHeading>
        <DropdownMenuItem label="Apples" icon={Folder} selected onSelect={close} />
        <DropdownMenuItem label="Pears" icon={Folder} meta="2 days ago" onSelect={close} />
        <DropdownMenuDivider />
        <DropdownMenuItem label="Add fruit" icon={Plus} onSelect={close} />
      </>
    ),
  },
};

export const Closed: Story = {
  args: { ...Open.args, defaultOpen: false },
};
