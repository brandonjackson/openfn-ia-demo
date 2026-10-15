import type { Step } from "../../types/history";
import { cn } from "../../utils/cn";

const icons: Record<string, [string, string]> = {
  pending: ["hero-ellipsis-horizontal-circle-solid", "text-gray-400"],
  success: ["hero-check-circle-solid", "text-green-500"],
  fail: ["hero-x-circle-solid", "text-red-500"],
  crash: ["hero-x-circle-solid", "text-orange-800"],
  cancel: ["hero-no-symbol-solid", "text-gray-600"],
  kill: ["hero-exclamation-circle-solid", "text-yellow-800"],
  exception: ["hero-exclamation-triangle-solid", "text-black"],
  lost: ["hero-exclamation-triangle-solid", "text-black"],
};

/** A step's exit-reason icon (run_live/components.ex `step_icon`). */
export default function StepIcon({ reason }: { reason: Step["exitReason"] | "cancel" | "kill" | "exception" | "lost" }) {
  const [icon, color] = icons[reason ?? "pending"] ?? icons.pending;
  return <span className={cn(icon, "mr-1.5 h-5 w-5 flex-shrink-0 inline-block", color)} />;
}
