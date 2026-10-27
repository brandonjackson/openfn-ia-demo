import { Plus } from "lucide-react";
import type { SuggestedSystem } from "../page-data";
import AdaptorLogo from "./AdaptorLogo";
import ListRow from "./ListRow";
import SectionHeading from "./SectionHeading";
import EntityPill from "./EntityPill";

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
          <EntityPill
            key={sys.name}
            name={sys.name}
            adaptor={sys.adaptor}
            title={sys.description}
            tone="suggested"
            onClick={() => onSelect?.(sys.name)}
          />
        ))}
      </>
    );
  }

  return (
    <section>
      <SectionHeading title="Suggested to add" variant="label" />
      <div className="space-y-2">
        {suggestions.map((sys) => (
          <ListRow
            key={sys.name}
            icon={Plus}
            logo={<AdaptorLogo adaptor={sys.adaptor} name={sys.name} />}
            title={sys.name}
            description={sys.description}
            onClick={() => onSelect?.(sys.name)}
            dashed
          />
        ))}
      </div>
    </section>
  );
}
