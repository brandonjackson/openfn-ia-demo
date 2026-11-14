import { Check, X, Repeat, Code } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EdgeCondition } from "../../model/workflow";
import DiagramMarker from "../primitives/DiagramMarker";

const config: Record<EdgeCondition, { icon: LucideIcon; title: string }> = {
  always: { icon: Repeat, title: "Always" },
  on_success: { icon: Check, title: "On success" },
  on_failure: { icon: X, title: "On failure" },
  js_expression: { icon: Code, title: "On match" },
};

/**
 * The badge on a workflow path, as Lightning draws it: a glyph for what
 * makes the path fire (always, on success, on failure, or a JavaScript
 * expression, whose rule shows on hover), the path's label beside it when it
 * has one, dashed when the path is off. With `onClick` it selects the path,
 * to edit it.
 */
export default function EdgeBadge({
  condition,
  expression,
  label,
  enabled = true,
  selected = false,
  onClick,
}: {
  condition: EdgeCondition;
  /** The expression an "On match" path matches on, shown on hover. */
  expression?: string;
  /** The path's name, drawn beside the badge. */
  label?: string;
  /** Off, the path is drawn dashed and never runs. */
  enabled?: boolean;
  /** Ringed while the path is open in the inspector. */
  selected?: boolean;
  /** Selects the path. */
  onClick?: () => void;
}) {
  const { icon, title } = config[condition];
  return (
    <DiagramMarker
      icon={icon}
      title={`${title} path`}
      detail={condition === "js_expression" ? expression : undefined}
      label={label}
      inactive={!enabled}
      selected={selected}
      onClick={onClick}
    />
  );
}
