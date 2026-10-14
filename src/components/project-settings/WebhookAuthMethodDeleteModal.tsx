import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../Alert";
import Button from "../Button";
import { Label, TextInput } from "../Inputs";
import Modal from "../Modal";
import { linkClass } from "./classes";
import type { WebhookAuthMethod } from "../../mock-data/project-settings";

interface Props {
  projectId: string;
  authMethod: WebhookAuthMethod;
  onCancel: () => void;
  onDelete: () => void;
}

const countLabel = (n: number, noun: string) => (n === 1 ? `1 ${noun}` : `${n} ${noun}s`);

/**
 * WebhookAuthMethodDeleteModal (workflow_live/webhook_auth_method_delete_modal.ex):
 * lists what loses protection and asks for "DELETE".
 */
export default function WebhookAuthMethodDeleteModal({ projectId, authMethod, onCancel, onDelete }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const { triggers } = authMethod;
  const channels = [...authMethod.channels].sort((a, b) => a.name.localeCompare(b.name));
  const unused = triggers.length === 0 && channels.length === 0;
  const valid = confirmation === "DELETE";

  return (
    <Modal
      open
      onClose={onCancel}
      title="Delete Authentication Method"
      footer={
        <>
          <Button theme="danger" disabled={!valid} onClick={onDelete}>
            Delete authentication method
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => (e.preventDefault(), valid && onDelete())}>
        <div className="space-y-4">
          {unused ? (
            <p>
              You are about to delete the webhook auth method "<span className="font-bold">{authMethod.name}</span>"
              which is used by no workflows or channels.
            </p>
          ) : (
            <p>
              You are about to delete the webhook auth method "<span className="font-bold">{authMethod.name}</span>".
              This cannot be undone, and it will be removed from everything listed below.
            </p>
          )}
          {triggers.length > 0 && (
            <Alert type="warning" header={`${countLabel(triggers.length, "workflow trigger")} will stop requiring authentication`}>
              <ul className="list-disc pl-5 space-y-1">
                {triggers.map((t) => (
                  <li key={t.triggerId}>
                    <Link to={`/projects/${projectId}/w/${t.workflowId}?s=${t.triggerId}`} className={linkClass}>
                      {t.workflowName}
                    </Link>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
          {channels.length > 0 && (
            <Alert type="danger" header={`${countLabel(channels.length, "channel")} will accept unauthenticated requests`}>
              <ul className="list-disc pl-5 space-y-1">
                {channels.map((c) => (
                  <li key={c.id}>
                    <Link to={`/projects/${projectId}/channels/${c.id}/edit`} className={linkClass}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                These channels stay enabled and keep forwarding requests to their destination with the project
                credential attached. Add another client auth method, or disable the channels, before deleting this one.
              </p>
            </Alert>
          )}
          <div>
            <Label htmlFor="delete_confirmation_confirmation">Type in 'DELETE' to confirm the deletion</Label>
            <TextInput
              id="delete_confirmation_confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
