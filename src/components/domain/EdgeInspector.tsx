import { AlertTriangle, ArrowRight, X } from "lucide-react";
import type { EdgeCondition, WorkflowEdge } from "../../model/workflow";
import { edgeConditionsFor, isEdgeEnabled, isUnsafeExpression } from "../../model/workflow";
import Code from "../primitives/Code";
import FormField from "../primitives/FormField";
import { Select, TextArea, TextInput } from "../primitives/FormControls";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Surface from "../primitives/Surface";
import Text from "../primitives/Text";
import TextLink from "../primitives/TextLink";
import ToggleSwitch from "../primitives/ToggleSwitch";

/** What editing a path changes. */
export type EdgeChanges = Partial<Pick<WorkflowEdge, "condition" | "expression" | "label" | "enabled">>;

interface Props {
  edge: WorkflowEdge;
  /** The name of what the path leaves: a step, or the trigger. */
  sourceLabel: string;
  /** The name of the step it leads to. */
  targetLabel: string;
  /** A path from a trigger is Always or On match, and is always on while its trigger is. */
  fromTrigger: boolean;
  /** Left out (on main), everything only reads. */
  onChange?: (changes: EdgeChanges) => void;
  onClose?: () => void;
}

/**
 * The path inspector, as Lightning has it: a card over the right of the
 * canvas for the selected path, with its label, its condition (always, on
 * success, on failure, or on match, with the JavaScript expression it
 * matches on) and whether it's on. A path from a trigger is Always or On
 * match, and is on whenever its trigger is.
 */
export default function EdgeInspector({ edge, sourceLabel, targetLabel, fromTrigger, onChange, onClose }: Props) {
  const readOnly = !onChange;
  const expression = edge.expression ?? "";
  const options = edgeConditionsFor(fromTrigger);

  return (
    <Surface as="section" variant="floating" aria-label="Path inspector" className="flex max-h-full w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-4 overflow-y-auto p-5">
      <Inline justify="between" gap="sm">
        <Stack gap="xs">
          <Text tone="strong">Path</Text>
          <Inline gap="xs">
            <Text size="xs" tone="muted" truncate>
              {sourceLabel}
            </Text>
            <ArrowRight size={12} aria-hidden />
            <Text size="xs" tone="muted" truncate>
              {targetLabel}
            </Text>
          </Inline>
        </Stack>
        {onClose && <IconButton label="Close inspector" icon={X} onClick={onClose} />}
      </Inline>

      <FormField label="Label" htmlFor="edge-label" optional hint="Drawn beside the path's badge on the canvas.">
        <TextInput id="edge-label" value={edge.label ?? ""} disabled={readOnly} onChange={(e) => onChange?.({ label: e.target.value })} />
      </FormField>

      <FormField label="Condition" htmlFor="edge-condition" hint={fromTrigger ? "A path from a trigger runs always, or when its expression matches." : undefined}>
        <Select
          id="edge-condition"
          fullWidth
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          value={edge.condition}
          disabled={readOnly}
          onChange={(e) => onChange?.({ condition: e.target.value as EdgeCondition })}
        />
      </FormField>

      {edge.condition === "js_expression" && (
        <FormField
          label="JavaScript expression"
          htmlFor="edge-expression"
          hint={
            <>
              A single expression with <Code>state</Code> from the step before in scope, e.g. <Code>!state.error</Code>.{" "}
              <TextLink variant="inline" href="https://docs.openfn.org/documentation/build/paths#writing-javascript-expressions-for-custom-path-conditions">
                How to write one
              </TextLink>
            </>
          }
        >
          <Stack gap="xs">
            <TextArea
              id="edge-expression"
              mono
              rows={3}
              spellCheck={false}
              placeholder="eg: !state.error"
              value={expression}
              disabled={readOnly}
              onChange={(e) => onChange?.({ expression: e.target.value })}
            />
            {isUnsafeExpression(expression) && (
              <Inline gap="xs">
                <AlertTriangle size={14} aria-hidden />
                <Text size="xs" tone="danger" role="alert">
                  The expression uses something that may be unsafe to run (import, require, process, await or eval).
                </Text>
              </Inline>
            )}
          </Stack>
        </FormField>
      )}

      {fromTrigger ? (
        <Text size="xs" tone="muted">
          This path is active whenever its trigger is.
        </Text>
      ) : (
        <ToggleSwitch
          label="Enabled"
          detail="A path that's off never runs."
          checked={isEdgeEnabled(edge)}
          disabled={readOnly}
          onChange={(on) => onChange?.({ enabled: on })}
        />
      )}
    </Surface>
  );
}
