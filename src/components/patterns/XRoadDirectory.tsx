import { useState } from "react";
import { Check, Network, Plus, RefreshCw } from "lucide-react";
import type { XRoadMember, XRoadMemberClass, XRoadRoute } from "../../model/xroad";
import { memberClassLabels, routeKey } from "../../model/xroad";
import { subsystemId } from "../../fixtures/xroad";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import EmptyState from "../primitives/EmptyState";
import ListRow from "../primitives/ListRow";
import SearchInput from "../primitives/SearchInput";
import SegmentedControl from "../primitives/SegmentedControl";

interface Props {
  members: XRoadMember[];
  /** Services already in your systems, as `memberId/subsystem/service`. */
  added?: string[];
  /** Adds a service to your systems with its X-Road route filled in. */
  onAdd?: (route: XRoadRoute) => void;
  /** When the directory was last read from X-Road. */
  syncedAt?: string;
}

const ALL = "All";

/**
 * Every service other members publish on X-Road, filled in from the national
 * directory (`listClients`) and grouped by organisation, then subsystem.
 * National directories get large, so it can be searched and narrowed by
 * member class. Each service has an Add button that puts it in your systems
 * with the X-Road route already filled in.
 */
export default function XRoadDirectory({ members, added = [], onAdd, syncedAt }: Props) {
  const [query, setQuery] = useState("");
  const classes = [...new Set(members.map((m) => m.memberClass))];
  const [memberClass, setMemberClass] = useState(ALL);

  const q = query.trim().toLowerCase();
  const matches = (...texts: string[]) => !q || texts.some((t) => t.toLowerCase().includes(q));

  const visible = members
    .filter((m) => memberClass === ALL || memberClassLabels[m.memberClass] === memberClass)
    .map((m) => ({
      ...m,
      subsystems: m.subsystems
        .map((sub) => ({
          ...sub,
          services: sub.services.filter((svc) =>
            matches(m.name, m.memberCode, sub.code, sub.description, svc.name, svc.description, svc.code)
          ),
        }))
        .filter((sub) => sub.services.length > 0),
    }))
    .filter((m) => m.subsystems.length > 0);
  const serviceCount = visible.reduce((n, m) => n + m.subsystems.reduce((k, s) => k + s.services.length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchInput
            compact
            placeholder="Search the directory"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SegmentedControl
          label="Member class"
          options={[ALL, ...classes.map((c: XRoadMemberClass) => memberClassLabels[c])]}
          value={memberClass}
          onChange={setMemberClass}
        />
        <span className="text-xs text-gray-400">
          {serviceCount} service{serviceCount === 1 ? "" : "s"} from {visible.length} organisation{visible.length === 1 ? "" : "s"}
        </span>
        {syncedAt && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400">
            <RefreshCw size={11} />
            Synced from the X-Road directory {syncedAt}
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Network} title="No services match your search." />
      ) : (
        <div className="space-y-5">
          {visible.map((member) => (
            <section key={member.id} aria-label={member.name} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
                <Badge label={memberClassLabels[member.memberClass]} />
              </div>
              {member.subsystems.map((sub) => (
                <div key={sub.code} className="space-y-2 border-l-2 border-gray-100 pl-3">
                  <p className="text-xs text-gray-500">
                    <code className="font-mono text-gray-700">{subsystemId(member, sub.code)}</code>
                    <span className="ml-2">{sub.description}</span>
                  </p>
                  {sub.services.map((svc) => {
                    const route = { memberId: member.id, subsystem: sub.code, service: svc.code };
                    const isAdded = added.includes(routeKey(route));
                    return (
                      <ListRow
                        key={svc.code}
                        icon={Network}
                        title={svc.name}
                        badges={svc.builtWithOpenFn && <Badge label="Built with OpenFn" tone="indigo" />}
                        description={svc.description}
                        meta={
                          <>
                            <code className="font-mono text-gray-500">{svc.code}</code>
                            {svc.methods.map((m) => (
                              <code key={m} className="font-mono text-gray-400">
                                {m}
                              </code>
                            ))}
                          </>
                        }
                        trailing={<span />}
                        actions={
                          isAdded ? (
                            <Badge label="Added" tone="green" icon={Check} />
                          ) : (
                            <Button variant="secondary" size="xs" icon={Plus} onClick={() => onAdd?.(route)}>
                              Add
                            </Button>
                          )
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
