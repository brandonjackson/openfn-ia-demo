import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Plus } from "lucide-react";
import ListGroup from "./ListGroup";
import ListRow from "./ListRow";
import Stack from "./Stack";
import Button from "./Button";

const meta: Meta<typeof ListGroup> = {
  title: "Primitives/ListGroup",
  component: ListGroup,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ListGroup>;

const rows = (
  <>
    <ListRow icon={FileText} title="Quarterly report" description="Sent to the board every quarter." />
    <ListRow icon={FileText} title="Supplier list" description="Everyone we buy from." />
  </>
);

export const Default: Story = {
  args: { title: "Finance", children: rows },
};

/** With how many rows it holds and a line on what it is. */
export const WithCountAndDescription: Story = {
  args: { title: "Finance", count: 2, description: "Documents the finance team keeps.", children: rows },
};

export const WithAction: Story = {
  args: { title: "Finance", count: 2, action: <Button size="sm" variant="secondary" icon={Plus}>Add</Button>, children: rows },
};

/** Groups on a page, 32px apart. */
export const SeveralGroups: Story = {
  render: () => (
    <Stack gap="xl">
      <ListGroup title="Finance" count={2}>{rows}</ListGroup>
      <ListGroup title="Operations" count={2}>{rows}</ListGroup>
    </Stack>
  ),
};
