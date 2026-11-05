import { Trash2 } from "lucide-react";
import type { AdaptorKind, JobNode } from "../../model/workflow";
import { adaptorChoices, adaptorInfo, credentialsFor } from "../../fixtures/adaptor-reference";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Button from "../primitives/Button";
import EntityPill from "../domain/EntityPill";
import ConnectionMethodBadge from "../domain/ConnectionMethodBadge";
import { connectionOf } from "../../model/connected-systems";
import { connectedSystems } from "../../fixtures/connected-systems";

export interface StepChanges {
  label?: string;
  adaptor?: AdaptorKind;
  credentialId?: string;
  /** The connected system, by id; picking one also picks its adaptor. */
  system?: string;
}

const NO_SYSTEM = "No connected system";

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
 * The step's config beside its code: name, the connected system it talks to,
 * adaptor and credential. A step just picks a system; whether that system is
 * reached directly or over X-Road shows only as a small badge, and an X-Road
 * system needs no credential. The adaptor's snippets live in their own view
 * next to this one.
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
  const system = step.system ? connectedSystems.find((s) => s.id === step.system) : undefined;
  const method = system ? connectionOf(system).method : undefined;

  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
          <span className="truncate text-sm font-semibold text-gray-900">{step.label}</span>
          <EntityPill name={adaptorInfo[step.adaptor].name} adaptor={step.adaptor} size="sm" />
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

        <FormField
          label="System"
          hint={
            method === "xroad"
              ? "Reached over X-Road: the route and headers come from your organisation's settings."
              : method === "direct"
                ? "Reached directly, with a credential."
                : "Pick a connected system, or leave it empty for code that only works on state."
          }
        >
          <div className="flex items-center gap-2">
            <Select
              className="w-full"
              options={[NO_SYSTEM, ...connectedSystems.map((s) => s.name)]}
              value={system?.name ?? NO_SYSTEM}
              disabled={readOnly}
              onChange={(e) => {
                const picked = connectedSystems.find((s) => s.name === e.target.value);
                onChange?.(picked ? { system: picked.id, adaptor: picked.adaptor } : { system: undefined });
              }}
            />
            {method && <ConnectionMethodBadge method={method} />}
          </div>
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

        <FormField
          label="Credential"
          hint={
            method === "xroad"
              ? "Not needed: your Security Server adds your organisation's identity."
              : info.needsCredential
                ? undefined
                : "This adaptor doesn't need one."
          }
        >
          {method === "xroad" ? (
            <Select className="w-full" options={["Via X-Road"]} value="Via X-Road" disabled />
          ) : info.needsCredential ? (
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
