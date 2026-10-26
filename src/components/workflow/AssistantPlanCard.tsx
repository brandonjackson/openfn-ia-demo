import type { AssistantPlan } from "../../mock-data/assistant";
import Button from "../Button";

interface Props {
  plan: AssistantPlan;
  onAccept?: () => void;
  onEdit?: () => void;
}

/**
 * A plan the assistant proposes before changing anything: numbered steps,
 * then "Make these changes" or "Edit plan". Once it's been accepted or turned
 * down the buttons give way to a note saying so.
 */
export default function AssistantPlanCard({ plan, onAccept, onEdit }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">Plan</div>
      <ol className="space-y-1.5">
        {plan.steps.map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-gray-800">
            <span className="w-3 flex-shrink-0 text-right font-mono text-xs text-gray-400">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-2">
        {plan.status === "accepted" ? (
          <span className="text-xs text-gray-500">Changes made.</span>
        ) : plan.status === "declined" ? (
          <span className="text-xs text-gray-500">Plan not used.</span>
        ) : (
          <>
            <Button variant="dark" size="sm" className="rounded-lg" onClick={onAccept}>
              Make these changes
            </Button>
            <Button variant="secondary" size="sm" className="rounded-lg" onClick={onEdit}>
              Edit plan
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
