import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import type { AdaptorKind, JobNode } from "../../model/workflow";
import type { AdaptorInfo, ProjectCredential } from "../../model/adaptor-reference";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Button from "../primitives/Button";
import Text from "../primitives/Text";
import EntityPill from "./EntityPill";
import ConnectionMethodBadge from "./ConnectionMethodBadge";
import StepCredentialPicker from "./StepCredentialPicker";
import { connectionOf } from "../../model/connected-systems";
import type { ConnectedSystem } from "../../model/connected-systems";
import { credentialsForStep } from "../../model/step-credentials";

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
  /** The adaptors the step can be switched to, in picker order: offered only without connected systems. */
  adaptorChoices: AdaptorInfo[];
  /** The project's credentials, on any adaptor: the panel offers those that fit the step's system and environment. */
  credentials: ProjectCredential[];
  /** The project's connected systems, to pick the step's from. */
  systems: ConnectedSystem[];
  credentialId?: string;
  /** Where the step runs, which credentials must have values for: the sandbox's environment, or "production" on main. */
  environment?: string;
  /** Changes each time the panel should scroll to the step's credential, e.g. from the canvas's Connect. */
  focusCredential?: number;
  /** Opens the credential form for the step's system. Left out, there's no New credential. */
  onNewCredential?: () => void;
  /** On main nothing can be changed. */
  readOnly?: boolean;
  onChange?: (changes: StepChanges) => void;
  onDelete?: () => void;
  /** Why the step can't be deleted, e.g. other steps run after it: Delete shows, off, saying so. */
  deleteBlockedReason?: string;
  /** Hide the name row when the panel sits in a tray that already names the step. */
  showHeader?: boolean;
}

/**
 * The step's config beside its code: name, the connected system it talks to
 * and its credential. A step's type is its system: picking one sets the
 * adaptor, which shows as text under it rather than as a choice of its own
 * (without connected systems, the adaptor is picked instead). Whether the
 * system is reached directly or over X-Road shows only as a small badge, and
 * an X-Road system needs no credential. Otherwise the credential is picked in
 * one click from the project's credentials for the system with values for
 * the environment the step runs in, or made new. The adaptor's snippets live
 * in their own view next to this one.
 */
export default function StepConfigPanel({
  step,
  adaptor: info,
  adaptorChoices,
  credentials,
  systems,
  credentialId,
  environment = "production",
  focusCredential,
  onNewCredential,
  readOnly = false,
  onChange,
  onDelete,
  deleteBlockedReason,
  showHeader = true,
}: Props) {
  // A step added from the picker may be on an adaptor outside the usual choices.
  const choices = adaptorChoices.some((a) => a.id === step.adaptor) ? adaptorChoices : [info, ...adaptorChoices];
  const system = step.system ? systems.find((s) => s.id === step.system) : undefined;
  const method = system ? connectionOf(system).method : undefined;
  const current = credentials.find((c) => c.id === credentialId);
  const options = credentialsForStep(credentials, step.adaptor, environment);

  // The canvas's Connect opens this panel scrolled to the credential.
  const credentialRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusCredential) credentialRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [focusCredential]);

  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
          <span className="truncate text-sm font-semibold text-gray-900">{step.label}</span>
          <EntityPill name={system?.name ?? info.name} adaptor={step.adaptor} size="sm" />
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

        {systems.length > 0 ? (
          <FormField
            label="System"
            htmlFor="step-system"
            hint={
              <>
                <Text block size="xs" tone="muted">
                  Adaptor: {info.name} {info.version} ({info.package})
                </Text>
                {method === "xroad"
                  ? "Reached over X-Road: the route and headers come from your organisation's settings."
                  : method === "direct"
                    ? undefined
                    : "Pick a connected system, or leave it empty for code that only works on state."}
              </>
            }
          >
            <div className="flex items-center gap-2">
              <Select
                id="step-system"
                className="w-full"
                options={[NO_SYSTEM, ...systems.map((s) => s.name)]}
                value={system?.name ?? NO_SYSTEM}
                disabled={readOnly}
                onChange={(e) => {
                  const picked = systems.find((s) => s.name === e.target.value);
                  // A different system is a different kind of credential: the old one goes with it.
                  onChange?.(picked ? { system: picked.id, adaptor: picked.adaptor, credentialId: undefined } : { system: undefined });
                }}
              />
              {method && <ConnectionMethodBadge method={method} />}
            </div>
          </FormField>
        ) : (
          <FormField label="Adaptor" htmlFor="step-adaptor" hint={`${info.package}@${info.version}`}>
            <Select
              id="step-adaptor"
              className="w-full"
              options={choices.map((a) => a.name)}
              value={info.name}
              disabled={readOnly}
              onChange={(e) => onChange?.({ adaptor: choices.find((a) => a.name === e.target.value)?.id, credentialId: undefined })}
            />
          </FormField>
        )}

        <div ref={credentialRef}>
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
            {method !== "xroad" && info.needsCredential ? (
              <StepCredentialPicker
                options={options}
                current={current}
                environment={environment}
                target={system?.name ?? info.name}
                readOnly={readOnly}
                onChoose={onChange ? (id) => onChange({ credentialId: id }) : undefined}
                onNew={readOnly ? undefined : onNewCredential}
              />
            ) : (
              <Text size="sm" tone="muted">
                {method === "xroad" ? "Via X-Road" : "No credential"}
              </Text>
            )}
          </FormField>
        </div>
      </div>
      {!readOnly && onDelete && (
        <div className="flex-none border-t border-gray-100 px-4 py-3">
          <Button
            variant="outline-danger"
            size="xs"
            icon={Trash2}
            onClick={onDelete}
            disabled={!!deleteBlockedReason}
            title={deleteBlockedReason}
          >
            Delete step
          </Button>
        </div>
      )}
    </div>
  );
}
