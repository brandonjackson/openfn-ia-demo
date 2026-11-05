import { useState } from "react";
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
   * Something to type before confirming, for actions that destroy a lot: a
   * project's name, or "DELETE". The confirm button stays off until it matches.
   */
  confirmPhrase?: string;
  /** The label over the box the phrase is typed into. */
  confirmPhraseLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** A yes/no dialog before an action that's hard to undo, e.g. deleting a workflow. */
export default function ConfirmModal({ open, ...rest }: Props) {
  // Mounting the body only while open clears anything typed on each open.
  if (!open) return null;
  return <ConfirmDialog {...rest} />;
}

function ConfirmDialog({
  title,
  children,
  confirmLabel = "Confirm",
  tone = "danger",
  confirmPhrase,
  confirmPhraseLabel,
  onConfirm,
  onClose,
}: Omit<Props, "open">) {
  const [typed, setTyped] = useState("");
  const matches = confirmPhrase === undefined || typed.trim() === confirmPhrase;
  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={tone} disabled={!matches} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-sm text-gray-600">{children}</div>
      {confirmPhrase !== undefined && (
        <div className="mt-4">
          <FormField label={confirmPhraseLabel ?? `Type ${confirmPhrase} to confirm`} htmlFor="confirm-phrase">
            <TextInput
              id="confirm-phrase"
              autoFocus
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches) onConfirm();
              }}
            />
          </FormField>
        </div>
      )}
    </Modal>
  );
}
