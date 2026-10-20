import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AddComponentOption {
  type: string;
  description: string;
  icon: LucideIcon;
}

interface Props {
  options: AddComponentOption[];
  onSelect?: (type: string) => void;
  title?: string;
}

/**
 * Every kind of component laid out as tiles, so all the options are visible
 * at once rather than tucked inside a dropdown.
 */
export default function AddComponentPanel({ options, onSelect, title = "Add New Component" }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-1.5">
        <Plus size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-400">{title}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
        {options.map(({ type, icon: Icon, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect?.(type)}
            className="group flex items-start gap-2.5 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
          >
            <Icon size={16} className="mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{type}</div>
              <div className="mt-0.5 text-xs leading-snug text-gray-400">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
