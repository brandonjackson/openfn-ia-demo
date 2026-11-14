import { KeyRound, Network } from "lucide-react";
import type { ConnectionMethod } from "../../model/connected-systems";
import Badge from "../primitives/Badge";

const methods: Record<
  ConnectionMethod,
  { label: string; title: string; tone: "gray" | "indigo"; icon: typeof Network }
> = {
  direct: { label: "Direct", title: "Reached directly with a credential", tone: "gray", icon: KeyRound },
  xroad: {
    label: "X-Road",
    title: "Reached through your X-Road Security Server",
    tone: "indigo",
    icon: Network,
  },
};

/**
 * How a connected system is reached: directly with a credential, or over
 * X-Road. A step's config, rows and pages show the same small badge; the
 * workflow canvas never shows the transport.
 */
export default function ConnectionMethodBadge({ method }: { method: ConnectionMethod }) {
  const m = methods[method];
  return (
    <span title={m.title} className="inline-flex">
      <Badge label={m.label} tone={m.tone} icon={m.icon} />
    </span>
  );
}
