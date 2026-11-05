import { Plus } from "lucide-react";
import type { ConnectedSystemSummary, SuggestedSystem } from "../../model/page-data";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import ProgressBar from "../primitives/ProgressBar";
import SectionHeading from "../primitives/SectionHeading";
import SuggestedSystemsToAdd from "./SuggestedSystemsToAdd";
import EntityPill from "./EntityPill";
import TextLink from "../primitives/TextLink";

interface Props {
  systems: ConnectedSystemSummary[];
  recommendedSystems: SuggestedSystem[];
  recommended: number;
  onAddSystem?: (systemName?: string) => void;
}

/**
 * Compact setup progress: one bar, then connected systems (linking to their
 * pages) and suggestions (opening the add flow) as one row of pills.
 */
export default function ConnectedSystemsSetupSection({
  systems,
  recommendedSystems,
  recommended,
  onAddSystem,
}: Props) {
  const total = systems.length;

  return (
    <section>
      <SectionHeading
        title="Finish setting up your connected systems"
        description={`${total} of ${recommended} recommended systems connected.`}
        action={
          <Button size="sm" icon={Plus} onClick={() => onAddSystem?.()}>
            Add system
          </Button>
        }
      />

      <Card className="space-y-4">
        <ProgressBar value={total} max={recommended} showCount />

        <div className="flex flex-wrap items-center gap-2">
          {systems.map((system) => (
            <EntityPill
              key={system.id}
              name={system.name}
              adaptor={system.adaptor}
              to={`/connected-systems/${system.id}`}
            />
          ))}
          <SuggestedSystemsToAdd
            variant="inline"
            suggestions={recommendedSystems}
            onSelect={onAddSystem}
          />
          <span className="ml-auto">
            <TextLink to="/connected-systems" variant="action">
              View all systems
            </TextLink>
          </span>
        </div>
      </Card>
    </section>
  );
}
