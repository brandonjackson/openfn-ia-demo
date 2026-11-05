import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FilterChip, { FilterChecklist, FilterDateRange, FilterOptions } from "./FilterChip";
import Inline from "./Inline";

const meta: Meta<typeof FilterChip> = {
  title: "Primitives/FilterChip",
  component: FilterChip,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

const workflows = [
  { id: "", label: "Any" },
  { id: "intake", label: "planning-application-workflow" },
  { id: "notify", label: "decision-notification-workflow" },
];

function OneOf({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [value, setValue] = useState("");
  const picked = workflows.find((w) => w.id === value);
  return (
    <FilterChip
      name="Workflow"
      label={`Workflow is ${value ? picked?.label : "any"}`}
      active={!!value}
      onClear={() => setValue("")}
      defaultOpen={defaultOpen}
      panelWidthClass="w-72"
    >
      {(close) => (
        <FilterOptions
          label="Workflow"
          options={workflows}
          value={value}
          onChange={(id) => {
            setValue(id);
            close();
          }}
        />
      )}
    </FilterChip>
  );
}

const statuses = [
  { id: "pending", label: "Pending", count: 1 },
  { id: "success", label: "Success", count: 6 },
  { id: "failed", label: "Failed", count: 4 },
  { id: "cancelled", label: "Cancelled", count: 0 },
];

function AnyOf({ defaultOpen = false, initial = [] as string[] }) {
  const [checked, setChecked] = useState(initial);
  const labels = statuses.filter((s) => checked.includes(s.id)).map((s) => s.label);
  return (
    <FilterChip
      name="Status"
      label={`Status is ${labels.length ? labels.join(" or ") : "any"}`}
      active={checked.length > 0}
      onClear={() => setChecked([])}
      defaultOpen={defaultOpen}
      panelWidthClass="w-52"
    >
      {() => <FilterChecklist options={statuses} checked={checked} onChange={setChecked} />}
    </FilterChip>
  );
}

const presets = [
  { label: "Last 24 hours", after: "2026-10-19T10:00" },
  { label: "Last 7 days", after: "2026-10-13T10:00" },
  { label: "Last 30 days", after: "2026-09-20T10:00" },
];

function DateRange({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [range, setRange] = useState({ after: "", before: "" });
  const preset = !range.before && presets.find((p) => p.after === range.after);
  const words = preset
    ? `in the ${preset.label.toLowerCase()}`
    : range.after || range.before
      ? `${range.after || "…"} to ${range.before || "now"}`
      : "any time";
  return (
    <FilterChip
      name="Received"
      label={`Received ${words}`}
      active={!!(range.after || range.before)}
      onClear={() => setRange({ after: "", before: "" })}
      defaultOpen={defaultOpen}
    >
      {() => (
        <FilterDateRange
          presets={presets}
          after={range.after}
          before={range.before}
          afterLabel="Received after"
          beforeLabel="Received before"
          onChange={(after, before) => setRange({ after, before })}
        />
      )}
    </FilterChip>
  );
}

/** A row of filters over a list, each saying what it's set to. */
export const Row: Story = {
  render: () => (
    <Inline wrap gap="sm">
      <OneOf />
      <AnyOf initial={["failed"]} />
      <DateRange />
      <FilterChip name="Work order" label="Work order a9628cb3" active onClear={() => {}} />
    </Inline>
  ),
};

/** One of several, closing on a pick. */
export const Options: Story = { render: () => <OneOf defaultOpen />, parameters: { layout: "fullscreen" } };

/** Any number, with how many each would show; stays open while you tick. */
export const Checklist: Story = { render: () => <AnyOf defaultOpen initial={["failed"]} /> };

/** Quick periods, then a range of your own. */
export const DateRangePanel: Story = { render: () => <DateRange defaultOpen /> };

/** Only says what's filtered, as when a link opened the list on one record. */
export const ReadOnly: Story = {
  render: () => <FilterChip name="Work order" label="Work order a9628cb3" active onClear={() => {}} />,
};
