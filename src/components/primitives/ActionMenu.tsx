import { MoreVertical } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import type { DropdownMenuItem } from "./DropdownMenu";
import IconButton from "./IconButton";

interface Props {
  /** Names the button and the menu for screen readers, e.g. "Actions for DHIS2 Play". */
  label: string;
  items: DropdownMenuItem[];
  onSelect: (id: string) => void;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * The ⋮ at the end of a table row or list row, opening its actions: edit,
 * transfer, delete. Lines up with the row's right edge.
 */
export default function ActionMenu({ label, items, onSelect, defaultOpen = false }: Props) {
  return (
    <DropdownMenu
      ariaLabel={label}
      items={items}
      onSelect={onSelect}
      align="right"
      widthClass="w-56"
      defaultOpen={defaultOpen}
      trigger={({ open, toggle }) => (
        <IconButton icon={MoreVertical} label={label} active={open} aria-expanded={open} aria-haspopup="menu" onClick={toggle} />
      )}
    />
  );
}
