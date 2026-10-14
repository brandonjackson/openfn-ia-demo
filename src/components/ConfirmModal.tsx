import type { ReactNode } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  /** What will happen, and anything the user needs to decide. */
  children: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel?: ReactNode;
  /** `danger` for destructive actions. */
  tone?: "primary" | "danger";
  confirmDisabled?: boolean;
}

/**
 * Asks the user to confirm one action. The confirm button only calls
 * `onConfirm`; close the modal from there once the action is done.
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  confirmDisabled = false,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button theme={tone} onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
          <Button theme="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-gray-600 space-y-3">{children}</div>
    </Modal>
  );
}
