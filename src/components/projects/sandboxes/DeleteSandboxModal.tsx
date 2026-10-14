import { useState } from "react";
import { sandboxGracePeriodLabel } from "../../../mock-data/sandboxes";
import Alert from "../../Alert";
import Button from "../../Button";
import { TextInput } from "../../Inputs";
import Modal from "../../Modal";

/**
 * "Delete sandbox" (SandboxLive.Components.confirm_delete_modal): what gets
 * removed, how many child sandboxes go with it, the grace period, and a
 * type-the-name confirmation that enables the red button.
 */
export default function DeleteSandboxModal({
  sandboxName,
  descendantCount = 0,
  isCurrent = false,
  rootName,
  onClose,
  onConfirm,
}: {
  sandboxName: string;
  descendantCount?: number;
  isCurrent?: boolean;
  rootName: string;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  const [typed, setTyped] = useState("");
  const valid = typed === sandboxName;

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Delete sandbox"
      footer={
        <>
          <Button
            theme="danger"
            type="submit"
            form="confirm-delete-sandbox-form"
            disabled={!valid}
            tooltip={valid ? undefined : "Type the sandbox name to enable"}
          >
            Delete sandbox
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-gray-700">
        <p>
          Deleting a sandbox removes it from OpenFn.
          {descendantCount === 1 && <span> Its child sandbox will also be deleted.</span>}
          {descendantCount > 1 && <span> Its {descendantCount} child sandboxes will also be deleted.</span>}
        </p>
        <p>
          Workflows, triggers, versions, keychain clones, and dataclips will be permanently removed.
        </p>
        {isCurrent && (
          <p>
            You are currently viewing this project. After deletion, you'll be redirected to <strong>{rootName}</strong>.
          </p>
        )}
        <p>To confirm, type the sandbox name below.</p>
        <Alert type="warning">
          This sandbox will be retained for {sandboxGracePeriodLabel} before being permanently removed. You can restore it
          from the sandbox list during that window.
        </Alert>
        <form
          id="confirm-delete-sandbox-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onConfirm?.();
          }}
        >
          <TextInput
            id="confirm-delete-name-input"
            label="Sandbox name"
            placeholder={sandboxName}
            required
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </form>
      </div>
    </Modal>
  );
}
