import { ArrowRight } from "lucide-react";
import type { ConnectedSystemSummary, SuggestedService } from "../page-data";
import Badge from "./Badge";
import type { BadgeTone } from "./Badge";
import Button from "./Button";

const categoryTones: Record<string, BadgeTone> = {
  "Data sync": "blue",
  "Event-driven": "purple",
  Interoperability: "green",
  Reporting: "yellow",
};

const FALLBACK_SYSTEM_COLOR = "bg-gray-100 text-gray-600";

function SystemPill({ name, color }: { name: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {name}
    </span>
  );
}

interface Props {
  service: SuggestedService;
  /** Connected systems, used to colour each system the service links. */
  systems: ConnectedSystemSummary[];
  onStart?: (service: SuggestedService) => void;
  onDismiss?: (service: SuggestedService) => void;
}

/**
 * A service we suggest building from the systems already connected: what it
 * does, which systems it links (from → to), why, and a way to start it.
 */
export default function SuggestedServiceCard({ service, systems, onStart, onDismiss }: Props) {
  const colorOf = (name: string) => systems.find((s) => s.name === name)?.color ?? FALLBACK_SYSTEM_COLOR;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm">
      <Badge label={service.category} tone={categoryTones[service.category]} />
      <h3 className="mt-2 text-sm font-semibold leading-snug text-gray-900">{service.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{service.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {service.fromSystems.map((name) => (
          <SystemPill key={name} name={name} color={colorOf(name)} />
        ))}
        <ArrowRight size={12} className="flex-shrink-0 text-gray-400" />
        {service.toSystems.map((name) => (
          <SystemPill key={name} name={name} color={colorOf(name)} />
        ))}
      </div>

      <p className="mt-2.5 text-xs italic leading-snug text-gray-400">{service.why}</p>

      <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-3">
        <Button size="xs" onClick={() => onStart?.(service)}>
          Start building
          <ArrowRight size={12} />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => onDismiss?.(service)}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
