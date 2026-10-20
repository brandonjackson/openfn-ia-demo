import { ChevronRight } from "lucide-react";
import type { SuggestedSystem } from "../page-data";
import AdaptorLogo from "./AdaptorLogo";
import SystemPill from "./SystemPill";

const defaultSuggestions: SuggestedSystem[] = [
  { name: "OpenMRS", description: "Electronic medical records", adaptor: "openmrs" },
  { name: "PostgreSQL", description: "Relational database", adaptor: "postgresql" },
  { name: "WhatsApp Business", description: "Messaging and notifications", adaptor: "whatsapp" },
];

interface Props {
  suggestions?: SuggestedSystem[];
  onSelect?: (systemName: string) => void;
  /**
   * `list` stacks each suggestion with its description; `inline` renders
   * compact dashed pills that wrap, for tight spaces like the Overview.
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
          <SystemPill
            key={sys.name}
            name={sys.name}
            adaptor={sys.adaptor}
            title={sys.description}
            suggested
            onClick={() => onSelect?.(sys.name)}
          />
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
            <AdaptorLogo adaptor={sys.adaptor} name={sys.name} size="sm" />
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
