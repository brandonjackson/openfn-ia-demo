import type { XRoadCall } from "../../fixtures/xroad";
import CopyValue from "../primitives/CopyValue";
import PropertyList from "../primitives/PropertyList";

/**
 * Who made a call that came in over X-Road, as the run recorded it: the
 * calling member and subsystem, the X-Road message ID (to match the run to
 * the Security Server's logs) and, where they were sent, the official and
 * the business case behind the call.
 */
export default function XRoadCallDetails({ call }: { call: XRoadCall }) {
  return (
    <div className="space-y-2">
      <PropertyList
        variant="plain"
        properties={[
          {
            label: "Caller",
            value: (
              <span className="min-w-0">
                <span className="block truncate">{call.clientName}</span>
                <code className="block truncate font-mono text-[11px] text-gray-500">{call.client}</code>
              </span>
            ),
          },
          { label: "Message ID", value: <CopyValue value={call.messageId} label="Copy message ID" /> },
          { label: "User ID", value: call.userId ?? <span className="text-gray-400">Not sent</span> },
          ...(call.issue ? [{ label: "Issue", value: call.issue }] : []),
        ]}
      />
      <p className="text-[11px] text-gray-400">Search the Security Server's logs for this message ID to find the same call.</p>
    </div>
  );
}
