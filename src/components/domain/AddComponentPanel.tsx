import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "../primitives/Badge";
import Card from "../primitives/Card";
import Inline from "../primitives/Inline";

export interface AddComponentOption {
  type: string;
  description: string;
  icon: LucideIcon;
  /** A short tag beside its name, e.g. "Added" for something already there that picking opens. */
  tag?: string;
}

interface Props {
  options: AddComponentOption[];
  onSelect?: (type: string) => void;
  title?: string;
  /** Tiles per row on wide screens: 4 across a page, 2 inside a dialog. */
  columns?: 2 | 4;
  /** Drop the card and its title row, e.g. when a dialog already names it. */
  bare?: boolean;
}

/**
 * Every kind of component laid out as tiles, so all the options are visible
 * at once rather than tucked inside a dropdown. The editor's Workflow group
 * uses it too, for what can be added to the workflow's files.
 */
export default function AddComponentPanel({ options, onSelect, title = "Add project component", columns = 4, bare = false }: Props) {
  const grid = (
    <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : ""} ${bare ? "" : "p-3"}`}>
      {options.map(({ type, icon: Icon, description, tag }) => (
        <Card key={type} padding="sm" onClick={() => onSelect?.(type)} className="flex items-start gap-2.5">
          <Icon size={16} className="mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-indigo-500" />
          <div>
            <Inline gap="sm">
              <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{type}</div>
              {tag && <Badge label={tag} shape="tag" />}
            </Inline>
            <div className="mt-0.5 text-xs leading-snug text-gray-400">{description}</div>
          </div>
        </Card>
      ))}
    </div>
  );
  if (bare) return grid;
  return (
    <Card flush>
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-1.5">
        <Plus size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-400">{title}</span>
      </div>
      {grid}
    </Card>
  );
}
