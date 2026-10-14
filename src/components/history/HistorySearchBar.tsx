import { useState } from "react";
import Button from "../Button";
import type { SearchFieldId } from "../../mock-data/history-extra";
import { cn } from "../../utils/cn";

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
  const [focused, setFocused] = useState(false);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 w-full">
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(value);
          }}
          id="run-search-form"
        >
          <div className="relative rounded-md shadow-xs w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="hero-magnifying-glass h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search work orders..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {focused && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue("");
                    setFocused(false);
                    onSearch("");
                  }}
                >
                  <span className="hero-x-mark h-5 w-5 text-gray-400" />
                </a>
              )}
            </div>
          </div>
        </form>
        <span className="text-sm text-gray-500">by</span>
        <div id="search_button_group" className="flex items-center gap-2">
          <div className="isolate inline-flex">
            {fields.map((f) => {
              const on = selected.includes(f.id);
              return (
                <div key={f.id} className="group">
                  <button
                    type="button"
                    title={f.label}
                    aria-label={f.label}
                    aria-pressed={on}
                    onClick={() => onToggle(f.id)}
                    className="relative inline-flex items-center"
                  >
                    <div
                      className={cn(
                        "ring-1 ring-inset ring-gray-300 px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 focus:z-10 group-first:rounded-l-md group-last:rounded-r-md -ml-px group-first:ml-0",
                        on ? "bg-gray-200" : "bg-white"
                      )}
                    >
                      <span className={cn(f.icon, "h-4 w-4 inline-block align-middle", on && "text-indigo-800")} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          <Button type="submit" form="run-search-form" className="truncate">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
