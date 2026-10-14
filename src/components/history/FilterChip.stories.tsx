import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import FilterChip, { FilterCheckboxes, FilterDateRange, FilterMenu } from "./FilterChip";
import { historyStatuses } from "../../mock-data/history-extra";

const meta = { title: "History/FilterChip", component: FilterChip } satisfies Meta<typeof FilterChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = { args: { children: "Workflow is any" } };
export const Active: Story = { args: { active: true, onClear: () => {}, children: "Last activity after 14-Sep" } };

function MenuDemo() {
    const [sel, setSel] = useState<string | null>(null);
    return (
      <FilterChip
        active={sel !== null}
        onClear={() => setSel(null)}
        dropdown={(close) => (
          <FilterMenu
            options={[
              { value: null, label: "Any" },
              { value: "a", label: "OpenHIE Workflow" },
              { value: "b", label: "Referral follow-ups" },
            ]}
            selected={sel}
            onSelect={(v) => {
              setSel(v);
              close();
            }}
          />
        )}
      >
        Workflow is {sel ?? "any"}
      </FilterChip>
    );
}

export const WithMenu: Story = { args: { children: "Workflow is any" }, render: () => <MenuDemo /> };

function CheckboxDemo() {
    const [checked, setChecked] = useState<string[]>(["failed"]);
    return (
      <FilterChip
        active={checked.length > 0}
        onClear={() => setChecked([])}
        dropdownClassName="w-44"
        dropdown={() => (
          <FilterCheckboxes
            options={historyStatuses}
            checked={checked}
            onToggle={(id) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
          />
        )}
      >
        Status is {checked.join(", ") || "any"}
      </FilterChip>
    );
}

export const WithCheckboxes: Story = { args: { children: "Status is any" }, render: () => <CheckboxDemo /> };

export const WithDateRange: Story = {
  args: { children: "Received any time" },
  render: () => (
    <FilterChip
      dropdownClassName=""
      dropdown={() => (
        <FilterDateRange
          title="Filter by Date Received"
          afterLabel="Received After"
          beforeLabel="Received Before"
          after=""
          before=""
          onChange={() => {}}
        />
      )}
    >
      Received any time
    </FilterChip>
  ),
};
