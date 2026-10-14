import { useState } from "react";
import Button from "../Button";
import IconButton from "../IconButton";
import type { SearchFieldId } from "../../mock-data/history-extra";
import SearchInput from "../SearchInput";

/**
 * History's search row (run_live/index.html.heex): the search input, "by",
 * the segmented toggles choosing what to search, and the Search button.
 */
export default function HistorySearchBar({
  fields,
  selected,
  onToggle,
  term,
  onSearch,
}: {
  fields: { id: SearchFieldId; icon: string; label: string }[];
  selected: SearchFieldId[];
  onToggle: (id: SearchFieldId) => void;
  term: string;
  onSearch: (term: string) => void;
}) {
  const [value, setValue] = useState(term);

  return (
    <div className="mt-2 flex items-center gap-2">
      <form
        className="flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(value);
        }}
        id="run-search-form"
      >
        <SearchInput value={value} onChange={setValue} onClear={() => onSearch("")} placeholder="Search work orders..." />
      </form>
      <span className="text-sm text-gray-500">by</span>
      <div id="search_button_group" className="flex items-center gap-2">
        <div className="inline-flex gap-0.5 rounded-md bg-white p-1 ring-1 ring-inset ring-gray-300">
          {fields.map((f) => (
            <IconButton
              key={f.id}
              icon={f.icon}
              label={f.label}
              active={selected.includes(f.id)}
              aria-pressed={selected.includes(f.id)}
              onClick={() => onToggle(f.id)}
            />
          ))}
        </div>
        <Button type="submit" form="run-search-form">
          Search
        </Button>
      </div>
    </div>
  );
}
