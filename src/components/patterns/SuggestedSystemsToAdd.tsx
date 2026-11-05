import { Plus } from "lucide-react";
import type { SuggestedSystem } from "../../model/page-data";
import AdaptorLogo from "../domain/AdaptorLogo";
import ListRow from "../primitives/ListRow";
import SectionHeading from "../primitives/SectionHeading";
import EntityPill from "../domain/EntityPill";

const defaultSuggestions: SuggestedSystem[] = [
  { name: "RapidPro", description: "SMS and chat flows", adaptor: "rapidpro" },
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
