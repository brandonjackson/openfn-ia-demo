import type { ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  open: boolean;
  title: string;
  /** What will happen, and that it can't be undone. */
  children: ReactNode;
  confirmLabel?: string;
  /** Red for destructive actions. */
  tone?: "danger" | "primary";
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
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-sm text-gray-600">{children}</div>
    </Modal>
  );
}
