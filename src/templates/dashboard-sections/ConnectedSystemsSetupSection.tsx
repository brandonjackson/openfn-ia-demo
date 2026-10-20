import { Check, Lock, Plus } from "lucide-react";
import type { ConnectedSystemSummary } from "../../page-data";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import ProgressBar from "../../components/ProgressBar";
import SectionHeading from "../../components/SectionHeading";
import SuggestedSystemsToAdd from "../../components/SuggestedSystemsToAdd";
import TextLink from "../../components/TextLink";

interface Props {
  systems: ConnectedSystemSummary[];
  recommendedSystems: { name: string; description: string }[];
  recommended: number;
  onAddSystem?: (systemName?: string) => void;
}

/**
 * Compact setup progress: one bar, then connected systems and suggestions
 * as a single row of chips.
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

      <Card className="space-y-3">
        <ProgressBar value={total} max={recommended} showCount />

        <div className="flex flex-wrap items-center gap-1.5">
          {systems.map((system) =>
            system.hasAccess ? (
              <Badge key={system.id} label={system.name} tone="green" icon={Check} />
            ) : (
              <Badge key={system.id} label={system.name} tone="gray" icon={Lock} />
            )
          )}
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
