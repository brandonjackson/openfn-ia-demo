import { useId, useState, type ReactNode } from "react";
import FormModal from "./FormModal";
import { TextInput } from "./Inputs";

/** A text field the user fills in to confirm, e.g. "type the project name". */
export interface Confirmation {
  id: string;
  label: ReactNode;
  /** The value that enables the confirm button. Omit to collect the text without checking it. */
  expected?: string;
  placeholder?: string;
  required?: boolean;
  /** Shown once the field loses focus holding a wrong, non-empty value. */
  mismatchError?: string;
  /** Hover text on the confirm button while it's disabled. */
  disabledTooltip?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the typed text when there's a `confirmation` field. */
  onConfirm: (typed: string) => void;
  title: ReactNode;
  /** What will happen, and anything the user needs to decide. */
  children: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel?: ReactNode;
  /** `danger` for destructive actions. */
  tone?: "primary" | "danger";
  confirmDisabled?: boolean;
  confirmId?: string;
  /** Ask the user to type something before the confirm button enables. */
  confirmation?: Confirmation;
  /** The form's id, when Lightning gives it one (e.g. `scheduled_deletion_form`). */
  formId?: string;
}

/**
 * Asks the user to confirm one action. The confirm button (or Enter) only
 * calls `onConfirm`; close the modal from there once the action is done.
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  confirmDisabled = false,
  confirmId,
  confirmation,
  formId,
}: Props) {
  const fallbackId = useId();
  const [typed, setTyped] = useState("");
  const [touched, setTouched] = useState(false);
  const expected = confirmation?.expected;
  const matches = expected === undefined || typed === expected;
  const disabled = confirmDisabled || !matches;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      formId={formId ?? fallbackId}
      formClassName="text-sm text-gray-600 space-y-3"
      onSubmit={() => onConfirm(typed)}
      submitLabel={confirmLabel}
      submitTheme={tone}
      submitDisabled={disabled}
      submitId={confirmId}
      submitTooltip={disabled ? confirmation?.disabledTooltip : undefined}
      cancelLabel={cancelLabel}
    >
      {children}
      {confirmation && (
        <TextInput
          id={confirmation.id}
          label={confirmation.label}
          placeholder={confirmation.placeholder}
          required={confirmation.required}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onBlur={() => setTouched(true)}
          errors={confirmation.mismatchError && touched && typed !== "" && !matches ? [confirmation.mismatchError] : []}
        />
      )}
    </FormModal>
  );
}
