import { useId, useState } from "react";
import type { ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";
import FormField from "./FormField";
import { TextInput } from "./FormControls";

interface Props {
  open: boolean;
  title: string;
  /** What will happen, and that it can't be undone. */
  children: ReactNode;
  confirmLabel?: string;
  /** Red for destructive actions. */
  tone?: "danger" | "primary";
  /**
   * Text the person has to type before they can confirm, such as the email
   * of the account or the name of the project being deleted.
   */
  confirmText?: string;
  /** The label over the box for `confirmText`, e.g. "Type the user's email to confirm". */
  confirmTextLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** A yes/no dialog before an action that's hard to undo, e.g. deleting a workflow. */
export default function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  tone = "danger",
  confirmText,
  confirmTextLabel = "Type it to confirm",
  onConfirm,
  onClose,
}: Props) {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const blocked = confirmText !== undefined && typed.trim() !== confirmText;
  const close = () => {
    setTyped("");
    onClose();
  };
  const confirm = () => {
    setTyped("");
    onConfirm();
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant={tone} onClick={confirm} disabled={blocked}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-sm text-gray-600">{children}</div>
      {confirmText !== undefined && (
        <div className="mt-4">
          <FormField label={confirmTextLabel} htmlFor={inputId}>
            <TextInput
              id={inputId}
              value={typed}
              placeholder={confirmText}
              autoComplete="off"
              onChange={(e) => setTyped(e.target.value)}
            />
          </FormField>
        </div>
      )}
    </Modal>
  );
}
