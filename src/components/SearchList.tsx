import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Fragment, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../utils/cn";
import Heading from "./Heading";
import SearchInput from "./SearchInput";

export interface SearchListSection<T> {
  key: string;
  /** Eyebrow heading above the section's items. */
  heading?: ReactNode;
  items: T[];
  /** Shown in place of the items when the section has none (e.g. "No projects found"). */
  empty?: ReactNode;
}

export interface SearchListItemState {
  /** Highlighted with the arrow keys or the mouse; Enter picks it. */
  active: boolean;
  /** The caller's current choice (`isSelected`), e.g. the project you're in. */
  selected: boolean;
}

interface Props<T> {
  /** A flat list. Use `sections` instead for headed groups. */
  items?: T[];
  sections?: SearchListSection<T>[];
  getKey: (item: T) => string;
  /** The row's content. The row itself (padding, highlight) comes from `size`. */
  renderItem: (item: T, state: SearchListItemState) => ReactNode;
  /** Accessible name for a row, when its content isn't enough. */
  getLabel?: (item: T) => string;
  isSelected?: (item: T) => boolean;
  /** The search text. The caller filters `items` / `sections` with it. */
  query: string;
  onQueryChange: (query: string) => void;
  /** Click or Enter on a row. */
  onSelect: (item: T) => void;
  placeholder?: string;
  /** Shown when there are no items at all. */
  emptyState?: ReactNode;
  /** Content between the search box and the rows, e.g. an alert. */
  header?: ReactNode;
  /** Extra content at the end of the search box (lg only), e.g. a keyboard hint. */
  inputAddon?: ReactNode;
  /** The row highlighted when the list opens; the first row otherwise. */
  initialActive?: T;
  /**
   * `lg`: a command palette: a borderless search row over full-width rows
   * that turn primary when highlighted, sections divided by a rule.
   * `sm`: a search field over rounded rows that turn gray, headed sections.
   */
  size?: "sm" | "lg";
  /** id of the list (the combobox's `aria-controls`). */
  listId?: string;
  /** Accessible name for the list. */
  listLabel?: string;
  autoFocus?: boolean;
}

const looks = {
  lg: {
    list: "max-h-80 overflow-y-auto py-2",
    section: "",
    heading: "px-4 py-2",
    option:
      "group flex cursor-pointer select-none items-center px-4 py-3 text-gray-900 hover:bg-primary-600 hover:text-white data-focus:bg-primary-600 data-focus:text-white",
  },
  sm: {
    list: "max-h-96 space-y-4 overflow-y-auto",
    section: "space-y-1",
    heading: "px-3 py-2",
    option: "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-100 data-focus:bg-gray-100",
  },
};

// Headless UI skips its own key handling when the React event says
// `defaultPrevented`. Marking only the React event (not the native one)
// leaves the key to the browser and the surrounding Dialog: Tab moves focus
// instead of picking the highlighted row, and Escape closes the modal at once.
function leaveToBrowser(e: KeyboardEvent) {
  Object.defineProperty(e, "defaultPrevented", { value: true });
}

/**
 * A search box over a list you pick from with the mouse or the keyboard
 * (Headless UI `Combobox`, always open). Arrow keys move the highlight and
 * wrap around at either end, Enter picks, Escape is left to the modal.
 * Filtering is the caller's: pass the matching `items` or `sections`.
 */
export default function SearchList<T>({
  items,
  sections: sectionsProp,
  getKey,
  renderItem,
  getLabel,
  isSelected = () => false,
  query,
  onQueryChange,
  onSelect,
  placeholder = "Search",
  emptyState,
  header,
  inputAddon,
  initialActive,
  size = "lg",
  listId,
  listLabel,
  autoFocus = true,
}: Props<T>) {
  const look = looks[size];
  const listRef = useRef<HTMLDivElement>(null);
  const sections: SearchListSection<T>[] = sectionsProp ?? [{ key: "items", items: items ?? [] }];
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" || e.key === "Escape") return leaveToBrowser(e);
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    // Wrap around at the ends (Headless UI stops there): from the last row
    // jump to the first with PageUp, from the first to the last with PageDown.
    const input = e.currentTarget;
    const options = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const active = input.getAttribute("aria-activedescendant");
    if (!active || options.length === 0) return;
    const edge = e.key === "ArrowDown" ? options[options.length - 1] : options[0];
    if (edge.id !== active) return;
    e.preventDefault();
    input.dispatchEvent(new globalThis.KeyboardEvent("keydown", { key: e.key === "ArrowDown" ? "PageUp" : "PageDown", bubbles: true }));
  };

  const inputProps = {
    autoFocus,
    onKeyDown,
    // Keeps the box in step with `query` whenever Headless UI resets it.
    displayValue: () => query,
  };

  let shownBefore = false;
  return (
    // `value` only seeds the highlight: Headless UI opens on the row matching it.
    <Combobox value={initialActive ?? null} onChange={(item: T | null) => item !== null && onSelect(item)} immediate>
      <div data-ui="search-list" data-size={size} className={cn(size === "sm" && "flex flex-col gap-3")}>
        {size === "lg" ? (
          <div className="flex items-center border-b border-gray-200 px-4">
            <span className="hero-magnifying-glass h-5 w-5 shrink-0 text-gray-400" />
            <ComboboxInput
              {...inputProps}
              type="text"
              spellCheck="false"
              autoComplete="off"
              placeholder={placeholder}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full border-0 py-4 pl-3 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0"
            />
            {inputAddon}
          </div>
        ) : (
          <SearchInput {...inputProps} inputAs={ComboboxInput} value={query} onChange={onQueryChange} placeholder={placeholder} size="sm" />
        )}
        <ComboboxOptions static ref={listRef} id={listId} aria-label={listLabel} className={look.list}>
          {header}
          {total === 0 && emptyState !== undefined ? (
            <div className="px-4 py-8 text-center text-gray-500">{emptyState}</div>
          ) : (
            sections.map((section) => {
              if (section.items.length === 0 && !section.empty) return null;
              const divider = size === "lg" && shownBefore && section.items.length > 0;
              shownBefore = true;
              return (
                <Fragment key={section.key}>
                  {divider && <div role="separator" className="my-2 border-t border-gray-200" />}
                  <div role="group" className={look.section}>
                    {section.heading && (
                      <Heading size="eyebrow" className={look.heading}>
                        {section.heading}
                      </Heading>
                    )}
                    {section.items.length === 0 && <div className="px-4 py-8 text-center text-gray-500">{section.empty}</div>}
                    {section.items.map((item) => {
                      const selected = isSelected(item);
                      return (
                        <ComboboxOption
                          key={getKey(item)}
                          value={item}
                          aria-label={getLabel?.(item)}
                          aria-selected={selected}
                          className={look.option}
                        >
                          {({ focus }) => <>{renderItem(item, { active: focus, selected })}</>}
                        </ComboboxOption>
                      );
                    })}
                  </div>
                </Fragment>
              );
            })
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
