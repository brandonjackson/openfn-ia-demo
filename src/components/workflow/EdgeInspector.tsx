import type { EdgeConditionType, EditorEdge } from "../../mock-data/workflow";
import Toggle from "../Toggle";
import EditorButton from "./EditorButton";
import TextField, { SelectField } from "./FormField";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";

interface Props {
  edge: EditorEdge;
  onChange: (patch: Partial<EditorEdge>) => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * The path inspector (inspector/EdgeInspector.tsx + EdgeForm.tsx): Label,
 * Condition, the JavaScript expression for "On Match", and a footer with
 * the Enabled toggle and Delete. Paths from a trigger have no footer.
 */
export default function EdgeInspector({ edge, onChange, onDelete, onClose }: Props) {
  const fromTrigger = !!edge.sourceTriggerId;
  const options: { value: EdgeConditionType; label: string }[] = fromTrigger
    ? [
        { value: "always", label: "Always" },
        { value: "js_expression", label: "On Match" },
      ]
    : [
        { value: "always", label: "Always" },
        { value: "on_job_success", label: "On Success" },
        { value: "on_job_failure", label: "On Failure" },
        { value: "js_expression", label: "On Match" },
      ];
  const expression = edge.conditionExpression ?? "";
  const unsafe = /(\bimport\b|\brequire\b|\bprocess\b|\bawait\b|\beval\b)/.test(expression);

  const footer = fromTrigger ? undefined : (
    <InspectorFooter
      leftButtons={
        <span className="inline-block" title="Enable or disable this path">
          <Toggle checked={edge.enabled} onChange={(enabled) => onChange({ enabled })} label="Enabled" />
        </span>
      }
      rightButtons={
        <span className="inline-block" title="Delete this path">
          <EditorButton
            variant="danger"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this edge? This action cannot be undone.")) onDelete();
            }}
          >
            Delete
          </EditorButton>
        </span>
      }
    />
  );

  return (
    <InspectorLayout title="Path" onClose={onClose} footer={footer}>
      <div className="px-6 py-6 space-y-4">
        <TextField
          name="condition_label"
          label="Label"
          value={edge.conditionLabel ?? ""}
          onChange={(e) => onChange({ conditionLabel: e.target.value || null })}
        />
        <SelectField
          name="condition_type"
          label="Condition"
          options={options}
          value={edge.conditionType}
          onChange={(v) => onChange({ conditionType: v as EdgeConditionType })}
        />
        {edge.conditionType === "js_expression" && (
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="condition_expression" className="text-sm font-medium text-slate-800">
                  Javascript Expression
                </label>
                {unsafe && (
                  <span
                    className="hero-exclamation-triangle text-yellow-600 h-4 w-4 inline-flex"
                    title="Expression contains potentially unsafe functions"
                  />
                )}
              </div>
              <textarea
                id="condition_expression"
                value={expression}
                onChange={(e) => onChange({ conditionExpression: e.target.value })}
                placeholder="eg: !state.error"
                className="block w-full h-24 px-3 py-2 rounded-md border-slate-300 font-mono text-slate-200 bg-slate-700 text-sm focus:border-slate-400 focus:ring-0"
              />
            </div>
            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer hover:text-slate-800">How to write expressions</summary>
              <div className="mt-2 space-y-1">
                <p>Use the state from the previous step to decide whether this step should run.</p>
                <p>Must be a single JavaScript expression with `state` in scope.</p>
                <p>
                  Check{" "}
                  <a
                    href="https://docs.openfn.org/documentation/build/paths#writing-javascript-expressions-for-custom-path-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    docs.openfn.org
                  </a>{" "}
                  for more details.
                </p>
              </div>
            </details>
          </div>
        )}
        {fromTrigger && <p className="text-xs text-slate-600 italic mt-4">This path will be active if its trigger is enabled</p>}
      </div>
    </InspectorLayout>
  );
}
