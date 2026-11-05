import { useState } from "react";
import type { ReactNode } from "react";
import { Check, Zap } from "lucide-react";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import CopyValue from "../primitives/CopyValue";
import Modal from "../primitives/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called from "Mark as published", once the values are in the Security Server. */
  onPublished?: () => void;
  serviceName: string;
  /** e.g. "register-case". */
  serviceCode: string;
  /** The generated OpenAPI 3 document. */
  descriptionUrl: string;
  /** The workflow's webhook. */
  backendUrl: string;
  /** The OpenFn subsystem, from the organisation's X-Road settings, e.g. `FJ/GOV/MOH/OPENFN`. */
  subsystem: string;
  /** Client subsystems that are expected to call the service. */
  clients?: string[];
  /** Where the Security Server is, to say which admin screen to open. */
  securityServer?: string;
}

interface Step {
  id: string;
  title: string;
  hint?: string;
  body: ReactNode;
}

/**
 * Publishing a workflow service to X-Road, for now by hand: a checklist of
 * the values to enter in the organisation's Security Server admin screen,
 * each with a copy button, ending with a reminder to grant access rights.
 * Publishing automatically (through the Security Server management API) is
 * shown but not available yet.
 */
export default function PublishToXRoadModal({
  open,
  onClose,
  onPublished,
  serviceName,
  serviceCode,
  descriptionUrl,
  backendUrl,
  subsystem,
  clients = [],
  securityServer,
}: Props) {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const steps: Step[] = [
    {
      id: "subsystem",
      title: "Open your OpenFn subsystem",
      hint: "Under Clients, from your organisation's X-Road settings.",
      body: <CopyValue value={subsystem} label="Copy subsystem" />,
    },
    {
      id: "type",
      title: "Add a REST service description of type OpenAPI 3",
      body: <CopyValue value="OpenAPI 3" label="Copy service type" />,
    },
    {
      id: "url",
      title: "Paste the description URL",
      hint: "The API docs OpenFn generates from the webhook trigger's annotations.",
      body: <CopyValue value={descriptionUrl} label="Copy description URL" />,
    },
    {
      id: "code",
      title: "Set the service code",
      body: <CopyValue value={serviceCode} label="Copy service code" />,
    },
    {
      id: "backend",
      title: "Set the service URL to the workflow's webhook",
      body: <CopyValue value={backendUrl} label="Copy backend URL" />,
    },
    {
      id: "access",
      title: "Grant access rights to the client subsystems that should call it",
      hint: "Until you do, every call is refused by your Security Server. Grant it per subsystem, never to a whole member.",
      body:
        clients.length > 0 ? (
          <div className="space-y-1.5">
            {clients.map((c) => (
              <CopyValue key={c} value={c} label="Copy client subsystem" />
            ))}
          </div>
        ) : undefined,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Publish "${serviceName}" to X-Road`}
      widthClass="max-w-2xl"
      footer={
        <>
          <span className="mr-auto text-xs text-gray-400">
            {done.length} of {steps.length} done
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" icon={Check} onClick={onPublished}>
            Mark as published
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        Enter these values in your Security Server's admin screen
        {securityServer ? (
          <>
            {" "}
            at <code className="font-mono text-gray-900">{securityServer}</code>
          </>
        ) : null}
        . Tick each one off as you go.
      </p>

      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => {
          const checked = done.includes(step.id);
          return (
            <li key={step.id} className="flex gap-3">
              <label className="mt-0.5 flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(step.id)}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600"
                  aria-label={step.title}
                />
                <span className="w-4 text-xs tabular-nums text-gray-400">{i + 1}</span>
              </label>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className={`text-sm font-medium ${checked ? "text-gray-400 line-through" : "text-gray-900"}`}>{step.title}</p>
                {step.hint && <p className="text-xs text-gray-500">{step.hint}</p>}
                {step.body}
              </div>
            </li>
          );
        })}
      </ol>

      <div
        aria-disabled="true"
        className="mt-5 flex items-start gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 opacity-60"
      >
        <input type="radio" disabled className="mt-1" aria-label="Publish automatically" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Zap size={14} className="text-gray-400" />
            Publish automatically
            <Badge label="Coming soon" />
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            OpenFn will add the service and its access rights for you, through the Security Server management API.
          </p>
        </div>
      </div>
    </Modal>
  );
}
