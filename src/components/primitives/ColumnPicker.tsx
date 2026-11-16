import { Columns3 } from "lucide-react";
import Button from "./Button";
import Surface from "./Surface";
import NavSection from "./NavSection";
import { FilterChecklist } from "./FilterChip";
import { usePopover } from "./use-popover";

export interface ColumnOption {
  id: string;
  label: string;
  /** A line under the label, e.g. which rows have a value in it. */
  description?: string;
  /** The heading it's listed under, e.g. "Channels"; options without one come first. */
  group?: string;
}

interface Props {
  /** The columns that can be added, beyond the ones a table always shows. */
  options: ColumnOption[];
  /** The ids of the columns showing. */
  value: string[];
  onChange: (value: string[]) => void;
  /** Start open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * The Columns button over a table, opening a checklist of the columns that
 * can be added to it. A table shows only what matters most until someone
 * asks for more, so its default view stays simple. Options can be grouped
 * under small headings, e.g. by the kind of row they apply to. Ticking keeps
 * it open; a click outside or Escape closes it.
 */
export default function ColumnPicker({ options, value, onChange, defaultOpen = false }: Props) {
  const { open, toggle, ref } = usePopover(defaultOpen);
  const groups = [...new Set(options.map((o) => o.group))];

  return (
    <div ref={ref} className="relative inline-flex">
      <Button size="sm" variant="secondary" icon={Columns3} aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
        {value.length > 0 ? `Columns (${value.length})` : "Columns"}
      </Button>
      {open && (
        <Surface variant="popover" role="dialog" aria-label="Columns" className="absolute right-0 top-full z-50 mt-1.5 flex w-64 flex-col gap-2 p-1.5">
          {groups.map((group) => (
            <NavSection key={group ?? ""} label={group}>
              <FilterChecklist
                options={options.filter((o) => o.group === group)}
                checked={value.filter((id) => options.some((o) => o.id === id && o.group === group))}
                onChange={(picked) => onChange([...value.filter((id) => !options.some((o) => o.id === id && o.group === group)), ...picked])}
              />
            </NavSection>
          ))}
        </Surface>
      )}
    </div>
  );
}
