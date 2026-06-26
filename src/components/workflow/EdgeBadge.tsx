import { Check, X, Repeat, Code } from "lucide-react";
import type { EdgeCondition } from "../../mock-data/workflow";

const config: Record<
  EdgeCondition,
  { icon: React.ElementType; title: string; classes: string }
> = {
  always: { icon: Repeat, title: "Always", classes: "text-gray-400" },
  on_success: { icon: Check, title: "On success", classes: "text-gray-500" },
  on_failure: { icon: X, title: "On failure", classes: "text-gray-500" },
  js_expression: { icon: Code, title: "Matches a condition", classes: "text-gray-500" },
};

/**
 * The little round badge that sits on a workflow connector, indicating what
 * makes the edge fire (always / on success / on failure / JS expression).
 */
export default function EdgeBadge({
  condition,
}: {
  condition: EdgeCondition;
}) {
  const { icon: Icon, title, classes } = config[condition];
  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-300 shadow-sm ${classes}`}
    >
      <Icon size={14} strokeWidth={2.5} />
    </span>
  );
}
