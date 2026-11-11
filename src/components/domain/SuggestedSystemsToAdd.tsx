import { Plus } from "lucide-react";
import type { SuggestedSystem } from "../../model/connected-systems";
import AdaptorLogo from "./AdaptorLogo";
import ListRow from "../primitives/ListRow";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import EntityPill from "./EntityPill";

interface Props {
  /** The systems to suggest, already without the ones that are connected. Draws nothing when empty. */
  suggestions: SuggestedSystem[];
  onSelect?: (systemName: string) => void;
  /**
   * `list` stacks each suggestion with its description; `inline` renders
   * compact dashed pills that wrap, for tight spaces like the Overview.
   */
  variant?: "list" | "inline";
}

export default function SuggestedSystemsToAdd({
  suggestions,
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

  if (suggestions.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Suggested to add" description="Systems you might connect next. Pick one to add it." />
      <Stack gap="sm">
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
      </Stack>
    </section>
  );
}
