import { Trash2 } from "lucide-react";
import type { AdaptorKind, JobNode } from "../../mock-data/workflow";
import { adaptorChoices, adaptorInfo, credentialsFor } from "../../mock-data/adaptor-reference";
import FormField from "../FormField";
import { Select, TextInput } from "../FormControls";
import Button from "../Button";
import AdaptorPill from "./AdaptorPill";

export interface StepChanges {
  label?: string;
  adaptor?: AdaptorKind;
  credentialId?: string;
}

interface Props {
  step: JobNode;
  credentialId?: string;
  /** On main nothing can be changed. */
  readOnly?: boolean;
  onChange?: (changes: StepChanges) => void;
  onDelete?: () => void;
  /** Hide the name row when the panel sits in a tray that already names the step. */
  showHeader?: boolean;
}

/**
 * The step's config beside its code: name, adaptor and credential. The
 * adaptor's snippets live in their own view next to this one.
 */
export default function StepConfigPanel({
  step,
  credentialId,
  readOnly = false,
  onChange,
  onDelete,
  showHeader = true,
}: Props) {
  const info = adaptorInfo[step.adaptor];
  // A step added from the picker may be on an adaptor outside the usual choices.
  const choices = adaptorChoices.includes(step.adaptor) ? adaptorChoices : [step.adaptor, ...adaptorChoices];
  const credentials = credentialsFor(step.adaptor);
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
            options={choices.map((a) => adaptorInfo[a].name)}
            value={info.name}
            disabled={readOnly}
            onChange={(e) =>
              onChange?.({ adaptor: choices.find((a) => adaptorInfo[a].name === e.target.value) })
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
