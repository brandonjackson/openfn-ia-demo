import { useState } from "react";
import { sandboxGracePeriodLabel } from "../../../mock-data/sandboxes";
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
      width="max-w-md"
      title={<span className="font-bold">Delete sandbox</span>}
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
      <section className="space-y-4">
        <p className="text-gray-700">
          Deleting a sandbox removes it from OpenFn.
          {descendantCount === 1 && <span> Its child sandbox will also be deleted.</span>}
          {descendantCount > 1 && <span> Its {descendantCount} child sandboxes will also be deleted.</span>}
        </p>
        <p className="text-gray-700">
          Workflows, triggers, versions, keychain clones, and dataclips will be permanently removed.
        </p>
        {isCurrent && (
          <p className="text-gray-700">
            You are currently viewing this project. After deletion, you'll be redirected to <strong>{rootName}</strong>.
          </p>
        )}
        <p className="text-gray-700">To confirm, type the sandbox name below.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-sm text-amber-800">
            This sandbox will be retained for {sandboxGracePeriodLabel} before being permanently removed. You can restore
            it from the sandbox list during that window.
          </p>
        </div>
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
      </section>
    </Modal>
  );
}
