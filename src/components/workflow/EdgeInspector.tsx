import { useState } from "react";
import type { EdgeConditionType, EditorEdge } from "../../mock-data/workflow";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import { Select, TextArea, TextInput } from "../Inputs";
import TextLink from "../TextLink";
import Toggle from "../Toggle";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fromTrigger = !!edge.sourceTriggerId;
  const options: [label: string, value: EdgeConditionType][] = fromTrigger
    ? [
        ["Always", "always"],
        ["On Match", "js_expression"],
      ]
    : [
        ["Always", "always"],
        ["On Success", "on_job_success"],
        ["On Failure", "on_job_failure"],
        ["On Match", "js_expression"],
      ];
  const expression = edge.conditionExpression ?? "";
  const unsafe = /(\bimport\b|\brequire\b|\bprocess\b|\bawait\b|\beval\b)/.test(expression);

  const footer = fromTrigger ? undefined : (
    <InspectorFooter
      leftButtons={
        <Toggle checked={edge.enabled} onChange={(enabled) => onChange({ enabled })} label="Enabled" tooltip="Enable or disable this path" />
      }
      rightButtons={
        <Button theme="danger" tooltip="Delete this path" onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      }
    />
  );

  return (
    <InspectorLayout title="Path" onClose={onClose} footer={footer}>
      <TextInput
        id="condition_label"
        label="Label"
        value={edge.conditionLabel ?? ""}
        onChange={(e) => onChange({ conditionLabel: e.target.value || null })}
      />
      <Select
        id="condition_type"
        label="Condition"
        options={options}
        value={edge.conditionType}
        onChange={(e) => onChange({ conditionType: e.target.value as EdgeConditionType })}
      />
      {edge.conditionType === "js_expression" && (
        <div className="space-y-2">
          <TextArea
            id="condition_expression"
            label={
              <span className="inline-flex items-center gap-2">
                Javascript Expression
                {unsafe && (
                  <span className="hero-exclamation-triangle h-4 w-4 text-yellow-600" title="Expression contains potentially unsafe functions" />
                )}
              </span>
            }
            value={expression}
            onChange={(e) => onChange({ conditionExpression: e.target.value })}
            placeholder="eg: !state.error"
            className="h-24 bg-gray-700 font-mono text-gray-200"
          />
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">How to write expressions</summary>
            <div className="mt-2 space-y-1">
              <p>Use the state from the previous step to decide whether this step should run.</p>
              <p>Must be a single JavaScript expression with `state` in scope.</p>
              <p>
                Check{" "}
                <TextLink to="https://docs.openfn.org/documentation/build/paths#writing-javascript-expressions-for-custom-path-conditions" external>
                  docs.openfn.org
                </TextLink>{" "}
                for more details.
              </p>
            </div>
          </details>
        </div>
      )}
      {fromTrigger && <p className="text-xs italic text-gray-600">This path will be active if its trigger is enabled</p>}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
        title="Delete Path?"
        confirmLabel="Delete"
        tone="danger"
      >
        <p>Are you sure you want to delete this edge? This action cannot be undone.</p>
      </ConfirmModal>
    </InspectorLayout>
  );
}
