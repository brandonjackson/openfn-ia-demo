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
}

export default function SuggestedSystemsToAdd({ suggestions = defaultSuggestions }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wide">
        Suggested to add
      </p>
      <ul className="space-y-2">
        {suggestions.map((sys) => (
          <li
            key={sys.name}
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
