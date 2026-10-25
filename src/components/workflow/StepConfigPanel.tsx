import { BookOpen, Trash2 } from "lucide-react";
import type { AdaptorKind, JobNode, Workflow } from "../../mock-data/workflow";
import { edgeConditionLabel, incomingEdge } from "../../mock-data/workflow";
import { adaptorChoices, adaptorInfo, adaptorSnippets, credentialsFor } from "../../mock-data/adaptor-reference";
import type { Snippet } from "../../mock-data/adaptor-reference";
import FormField from "../FormField";
import { Select, TextInput } from "../FormControls";
import Button from "../Button";
import AdaptorPill from "./AdaptorPill";
import SnippetRow from "./SnippetRow";

export interface StepChanges {
  label?: string;
  adaptor?: AdaptorKind;
  credentialId?: string;
}

interface Props {
  step: JobNode;
  workflow: Workflow;
  credentialId?: string;
  /** On main nothing can be changed. */
  readOnly?: boolean;
  onChange?: (changes: StepChanges) => void;
  /** Appends a snippet to the step's code. */
  onInsertSnippet?: (snippet: Snippet) => void;
  /** Opens the full adaptor reference tray. */
  onOpenReference?: () => void;
  onDelete?: () => void;
  /** Hide the name row when the panel sits in a tray that already names the step. */
  showHeader?: boolean;
}

/**
 * The step's settings beside its code: name, adaptor, credential and what it
 * runs after. Under those sit the adaptor's most-used operations as
 * snippets, so the reference is one click from the code; the full reference
 * opens in its own tray.
 */
export default function StepConfigPanel({
  step,
  workflow,
  credentialId,
  readOnly = false,
  onChange,
  onInsertSnippet,
  onOpenReference,
  onDelete,
  showHeader = true,
}: Props) {
  const info = adaptorInfo[step.adaptor];
  const credentials = credentialsFor(step.adaptor);
  const edge = incomingEdge(workflow, step.id);
  const upstream = edge ? workflow.nodes.find((n) => n.id === edge.source) : undefined;
  const runsAfter = upstream ? `${upstream.label} · ${edgeConditionLabel[edge!.condition]}` : "Nothing (start of workflow)";
  const credentialOptions = ["No credential", ...credentials.map((c) => c.name)];
  const credentialValue = credentials.find((c) => c.id === credentialId)?.name ?? "No credential";

  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
          <span className="truncate text-sm font-semibold text-gray-900">{step.label}</span>
          <AdaptorPill adaptor={step.adaptor} />
        </div>
      )}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <FormField label="Name" htmlFor="step-name">
          <TextInput
            id="step-name"
            value={step.label}
            disabled={readOnly}
            onChange={(e) => onChange?.({ label: e.target.value })}
          />
        </FormField>

        <FormField label="Adaptor" hint={`${info.package}@${info.version}`}>
          <Select
            className="w-full"
            options={adaptorChoices.map((a) => adaptorInfo[a].name)}
            value={info.name}
            disabled={readOnly}
            onChange={(e) =>
              onChange?.({ adaptor: adaptorChoices.find((a) => adaptorInfo[a].name === e.target.value) })
            }
          />
        </FormField>

        <FormField label="Credential" hint={info.needsCredential ? undefined : "This adaptor doesn't need one."}>
          {info.needsCredential ? (
            <Select
              className="w-full"
              options={credentialOptions}
              value={credentialValue}
              disabled={readOnly}
              onChange={(e) => onChange?.({ credentialId: credentials.find((c) => c.name === e.target.value)?.id })}
            />
          ) : (
            <Select className="w-full" options={["No credential"]} value="No credential" disabled />
          )}
        </FormField>

        <FormField label="Runs after">
          <Select className="w-full" options={[runsAfter]} value={runsAfter} disabled />
        </FormField>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{info.name} snippets</span>
            {onOpenReference && (
              <button
                type="button"
                onClick={onOpenReference}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <BookOpen size={12} /> Full reference
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {adaptorSnippets[step.adaptor].slice(0, 4).map((s) => (
              <SnippetRow key={s.id} snippet={s} onInsert={readOnly ? undefined : onInsertSnippet} />
            ))}
          </div>
        </div>
      </div>
      {!readOnly && onDelete && (
        <div className="flex-none border-t border-gray-100 px-4 py-3">
          <Button variant="outline-danger" size="xs" icon={Trash2} onClick={onDelete}>
            Delete step
          </Button>
        </div>
      )}
    </div>
  );
}
