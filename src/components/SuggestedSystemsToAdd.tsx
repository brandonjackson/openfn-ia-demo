import { ChevronRight, Plus } from "lucide-react";

interface SuggestedSystem {
  name: string;
  description: string;
}

const defaultSuggestions: SuggestedSystem[] = [
  { name: "OpenMRS", description: "Electronic medical records" },
  { name: "PostgreSQL", description: "Relational database" },
  { name: "WhatsApp Business", description: "Messaging & notifications" },
];

interface Props {
  suggestions?: SuggestedSystem[];
  onSelect?: (systemName: string) => void;
  /**
   * `list` stacks each suggestion with its description; `inline` renders
   * compact dashed chips that wrap, for tight spaces like the Overview.
   */
  variant?: "list" | "inline";
}

export default function SuggestedSystemsToAdd({
  suggestions = defaultSuggestions,
  onSelect,
  variant = "list",
}: Props) {
  if (variant === "inline") {
    return (
      <>
        {suggestions.map((sys) => (
          <button
            key={sys.name}
            type="button"
            title={sys.description}
            onClick={() => onSelect?.(sys.name)}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Plus size={10} />
            {sys.name}
          </button>
        ))}
      </>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wide">
        Suggested to add
      </p>
      <ul className="space-y-2">
        {suggestions.map((sys) => (
          <li
            key={sys.name}
            onClick={() => onSelect?.(sys.name)}
            className="flex items-center gap-2.5 rounded-md border border-dashed border-gray-200 px-2.5 py-2 hover:border-blue-200 hover:bg-blue-50/30 group cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-md border border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-300">
              <Plus size={11} className="text-gray-400 group-hover:text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{sys.name}</p>
              <p className="text-xs text-gray-400">{sys.description}</p>
            </div>
            <ChevronRight size={13} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
