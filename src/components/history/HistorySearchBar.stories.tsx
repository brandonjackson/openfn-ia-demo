import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import HistorySearchBar from "./HistorySearchBar";
import { historySearchFields, type SearchFieldId } from "../../mock-data/history-extra";

const meta = { title: "History/HistorySearchBar", component: HistorySearchBar } satisfies Meta<typeof HistorySearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo(args: ComponentProps<typeof HistorySearchBar>) {
  const [selected, setSelected] = useState<SearchFieldId[]>(args.selected);
  return (
    <HistorySearchBar
      {...args}
      selected={selected}
      onToggle={(id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
    />
  );
}

export const Default: Story = {
  args: { fields: historySearchFields, selected: ["log"], onToggle: () => {}, term: "", onSearch: () => {} },
  render: (args) => <Demo {...args} />,
};
