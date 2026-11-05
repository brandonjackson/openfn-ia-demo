import { Check } from "lucide-react";
import type { XRoadConnectionStatus } from "../../model/xroad";
import { xroadStatusSteps } from "../../model/xroad";

interface Props {
  status: XRoadConnectionStatus;
  /** When each status was reached. */
  history?: { status: XRoadConnectionStatus; date: string }[];
}

/**
 * The steps a connection to another member's X-Road service goes through:
 * discovered, agreement pending, operator approval, access granted, live.
 * Steps already passed are ticked, with the date they were reached.
 */
export default function XRoadStatusTrack({ status, history = [] }: Props) {
  const current = xroadStatusSteps.findIndex((s) => s.id === status);
  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Connection status">
      {xroadStatusSteps.map((step, i) => {
        const done = i < current || status === "live";
        const isCurrent = i === current;
        const date = history.find((h) => h.status === step.id)?.date;
        return (
          <li key={step.id} className="min-w-0" aria-current={isCurrent ? "step" : undefined}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  done
                    ? "bg-indigo-600 text-white"
                    : isCurrent
                      ? "border-2 border-indigo-600 bg-white text-indigo-600"
                      : "border border-gray-300 bg-white text-gray-400"
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              {i < xroadStatusSteps.length - 1 && (
                <span className={`h-0.5 flex-1 rounded ${i < current ? "bg-indigo-600" : "bg-gray-200"}`} />
              )}
            </div>
            <p className={`mt-2 text-xs font-medium ${done || isCurrent ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
            <p className="text-[11px] text-gray-400">{date ?? (isCurrent ? "In progress" : " ")}</p>
          </li>
        );
      })}
    </ol>
  );
}
