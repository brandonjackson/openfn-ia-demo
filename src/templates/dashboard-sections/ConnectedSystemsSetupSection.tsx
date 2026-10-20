import { Check, CheckCircle2, Lock, Plus } from "lucide-react";
import type { ConnectedSystemSummary } from "../../page-data";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Callout from "../../components/Callout";
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

export default function ConnectedSystemsSetupSection({
  systems,
  recommendedSystems,
  recommended,
  onAddSystem,
}: Props) {
  const total = systems.length;
  // Same typology as the Access filter on the Connected Systems page
  const withAccessCount = systems.filter((s) => s.hasAccess).length;
  const noAccessCount = total - withAccessCount;

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

      <Card flush>
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
          <ProgressBar value={total} max={recommended} showCount />
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
          <div>
            <SectionHeading title={`Connected (${total})`} variant="label" />
            <ul className="space-y-1.5">
              {systems.map((system) => (
                <li
                  key={system.id}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 hover:bg-gray-50"
                >
                  <CheckCircle2 size={14} className="flex-shrink-0 text-green-500" />
                  <span className="flex-1 text-sm text-gray-800">{system.name}</span>
                  {system.hasAccess ? (
                    <Badge label="You have access" tone="green" icon={Check} />
                  ) : (
                    <Badge label="No access" tone="gray" icon={Lock} />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <SuggestedSystemsToAdd suggestions={recommendedSystems} onSelect={onAddSystem} />
            <Callout variant="info" title="Why connect your systems?">
              <ul className="list-disc space-y-1.5 pl-4">
                <li>
                  <strong>Connect once.</strong> Org-shared credentials mean everyone on your team gets
                  access, without sharing passwords.
                </li>
                <li>
                  <strong>Instant value.</strong> As soon as a system is connected you get observability,
                  channels, mock data, and credential management out of the box.
                </li>
                <li>
                  <strong>Smart suggestions.</strong> The more systems you connect, the smarter your
                  service recommendations become.
                </li>
              </ul>
            </Callout>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 pb-4">
          <span className="text-xs text-gray-400">
            {withAccessCount} with access · {noAccessCount} without
          </span>
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
