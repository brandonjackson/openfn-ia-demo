import { Trash2 } from "lucide-react";
import type { AdaptorKind, JobNode } from "../../model/workflow";
import type { AdaptorInfo, ProjectCredential } from "../../model/adaptor-reference";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Button from "../primitives/Button";
import EntityPill from "./EntityPill";
import ConnectionMethodBadge from "./ConnectionMethodBadge";
import { connectionOf } from "../../model/connected-systems";
import type { ConnectedSystem } from "../../model/connected-systems";

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
  /** The step's adaptor: its name, package, version and whether it needs a credential. */
  adaptor: AdaptorInfo;
  /** The adaptors the step can be switched to, in picker order. */
  adaptorChoices: AdaptorInfo[];
  /** The project's credentials for the step's adaptor. */
  credentials: ProjectCredential[];
  /** The project's connected systems, to pick the step's from. */
  systems: ConnectedSystem[];
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
  adaptor: info,
  adaptorChoices,
  credentials,
  systems,
  credentialId,
  readOnly = false,
  onChange,
  onDelete,
  showHeader = true,
}: Props) {
  // A step added from the picker may be on an adaptor outside the usual choices.
  const choices = adaptorChoices.some((a) => a.id === step.adaptor) ? adaptorChoices : [info, ...adaptorChoices];
  const credentialOptions = ["No credential", ...credentials.map((c) => c.name)];
  const credentialValue = credentials.find((c) => c.id === credentialId)?.name ?? "No credential";
  const system = step.system ? systems.find((s) => s.id === step.system) : undefined;
  const method = system ? connectionOf(system).method : undefined;

  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
          <span className="truncate text-sm font-semibold text-gray-900">{step.label}</span>
          <EntityPill name={info.name} adaptor={step.adaptor} size="sm" />
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
              options={[NO_SYSTEM, ...systems.map((s) => s.name)]}
              value={system?.name ?? NO_SYSTEM}
              disabled={readOnly}
              onChange={(e) => {
                const picked = systems.find((s) => s.name === e.target.value);
                onChange?.(picked ? { system: picked.id, adaptor: picked.adaptor } : { system: undefined });
              }}
            />
            {method && <ConnectionMethodBadge method={method} />}
          </div>
        </FormField>

        <FormField label="Adaptor" hint={`${info.package}@${info.version}`}>
          <Select
            className="w-full"
            options={choices.map((a) => a.name)}
            value={info.name}
            disabled={readOnly}
            onChange={(e) =>
              onChange?.({ adaptor: choices.find((a) => a.name === e.target.value)?.id })
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
