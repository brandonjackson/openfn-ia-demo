import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";
import Button from "./Button";
import Modal from "./Modal";

interface Props extends Omit<ComponentProps<typeof Modal>, "footer" | "bare"> {
  /** The form's id; the submit button points at it, so it works from the footer. Keep Lightning's ids. */
  formId: string;
  /** Called on submit (button or Enter), unless `submitDisabled`. */
  onSubmit: () => void;
  submitLabel: ReactNode;
  submitTheme?: "primary" | "danger";
  submitDisabled?: boolean;
  submitId?: string;
  /** Shown on hover over the submit button, e.g. why it's disabled. */
  submitTooltip?: string;
  cancelLabel?: ReactNode;
  cancelId?: string;
  /** Classes for the form, i.e. the spacing between fields. */
  formClassName?: string;
  /** Content above the form, outside it (e.g. an Alert). */
  before?: ReactNode;
}

/**
 * A Modal wrapping one form, with the standard footer: the submit button
 * and a secondary Cancel. Enter submits; nothing happens while
 * `submitDisabled`. Use Modal's `footer` directly for anything else.
 */
export default function FormModal({
  formId,
  onSubmit,
  submitLabel,
  submitTheme = "primary",
  submitDisabled = false,
  submitId,
  submitTooltip,
  cancelLabel = "Cancel",
  cancelId,
  formClassName = "space-y-6",
  before,
  onClose,
  children,
  ...modal
}: Props) {
  return (
    <Modal
      onClose={onClose}
      {...modal}
      footer={
        <>
          <Button id={submitId} type="submit" form={formId} theme={submitTheme} disabled={submitDisabled} tooltip={submitTooltip}>
            {submitLabel}
          </Button>
          <Button id={cancelId} theme="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      {before}
      <form
        id={formId}
        className={cn(formClassName)}
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitDisabled) onSubmit();
        }}
      >
        {children}
      </form>
    </Modal>
  );
}
