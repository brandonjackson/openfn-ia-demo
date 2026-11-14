import { KeyRound, Network } from "lucide-react";
import type { ConnectionMethod } from "../../model/connected-systems";
import Badge from "../primitives/Badge";

const methods: Record<
  ConnectionMethod,
  { label: string; title: string; tone: "gray" | "indigo"; icon: typeof Network; chip: string }
> = {
  direct: { label: "Direct", title: "Reached directly with a credential", tone: "gray", icon: KeyRound, chip: "bg-gray-100 text-gray-700" },
  xroad: {
    label: "X-Road",
    title: "Reached through your X-Road Security Server",
    tone: "indigo",
    icon: Network,
    chip: "bg-badge-indigo-bg text-badge-indigo-fg",
  },
};

/**
 * How a connected system is reached: directly with a credential, or over
 * X-Road. Steps, rows and pages show the same small badge, and it's the only
 * place a workflow shows the transport at all. `compact` is just the icon in
 * a small round chip (named by its tooltip), for a canvas card's crowded head.
 */
export default function ConnectionMethodBadge({ method, compact = false }: { method: ConnectionMethod; compact?: boolean }) {
  const m = methods[method];
  if (compact) {
    const Icon = m.icon;
    return (
      <span
        title={m.title}
        className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${m.chip}`}
      >
        <Icon size={11} aria-hidden />
        <span className="sr-only">{m.label}</span>
      </span>
    );
  }
  return (
    <span title={m.title} className="inline-flex">
      <Badge label={m.label} tone={m.tone} icon={m.icon} />
    </span>
  );
}
