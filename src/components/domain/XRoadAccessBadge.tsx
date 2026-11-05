import { Check, Clock, Search } from "lucide-react";
import type { XRoadConnectionStatus } from "../../model/xroad";
import Badge from "../primitives/Badge";
import type { BadgeTone } from "../primitives/Badge";

const badges: Record<XRoadConnectionStatus, { label: string; tone: BadgeTone; icon: typeof Check }> = {
  discovered: { label: "Not requested", tone: "gray", icon: Search },
  "agreement-pending": { label: "Agreement pending", tone: "yellow", icon: Clock },
  "operator-approval": { label: "Awaiting operator", tone: "yellow", icon: Clock },
  "access-granted": { label: "Access granted", tone: "green", icon: Check },
  live: { label: "Live", tone: "green", icon: Check },
};

/**
 * Whether calls to an X-Road system will go through, driven by where its
 * connection is on the status track. Shown in place of the usual access
 * badge on X-Road systems.
 */
export default function XRoadAccessBadge({ status }: { status: XRoadConnectionStatus }) {
  const b = badges[status];
  return <Badge label={b.label} tone={b.tone} icon={b.icon} />;
}
