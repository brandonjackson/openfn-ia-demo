import type { Meta, StoryObj } from "@storybook/react";
import ListHeader from "./ListHeader";
import Card from "./Card";
import Checkbox from "./Checkbox";

const meta: Meta<typeof ListHeader> = {
  title: "Primitives/ListHeader",
  component: ListHeader,
};

export default meta;
type Story = StoryObj<typeof ListHeader>;

export const Default: Story = {
  render: () => (
    <Card flush>
      <ListHeader leading={<Checkbox label="Select all" hideLabel checked={false} indeterminate onChange={() => {}} />}>
        12 work orders, newest first
      </ListHeader>
    </Card>
  ),
};
