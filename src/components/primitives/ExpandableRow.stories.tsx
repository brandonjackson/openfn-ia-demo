import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ExpandableRow from "./ExpandableRow";
import Card from "./Card";
import Stack from "./Stack";
import Text from "./Text";
import Checkbox from "./Checkbox";
import Badge from "./Badge";

const meta: Meta<typeof ExpandableRow> = {
  title: "Primitives/ExpandableRow",
  component: ExpandableRow,
};

export default meta;
type Story = StoryObj<typeof ExpandableRow>;

function Row({ title, startOpen = false }: { title: string; startOpen?: boolean }) {
  const [expanded, setExpanded] = useState(startOpen);
  const [selected, setSelected] = useState(false);
  return (
    <ExpandableRow
      label={title}
      expanded={expanded}
      onToggle={() => setExpanded((e) => !e)}
      selected={selected}
      leading={<Checkbox label={`Select ${title}`} hideLabel checked={selected} onChange={setSelected} />}
      trailing={<Badge label="Live" />}
      details={<Text tone="muted">More about {title}, shown while the row is open.</Text>}
    >
      <Text tone="strong">{title}</Text>
    </ExpandableRow>
  );
}

export const Default: Story = {
  render: () => (
    <Card flush>
      <Stack divided>
        <Row title="First row" startOpen />
        <Row title="Second row" />
        <Row title="Third row" />
      </Stack>
    </Card>
  ),
};
