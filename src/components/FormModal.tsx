import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";
import { errorMessage, RequestError } from "../utils/errors";
import { useAction } from "../utils/useAction";
import Alert from "./Alert";
import Button from "./Button";
import Modal from "./Modal";

interface Props extends Omit<ComponentProps<typeof Modal>, "footer" | "bare"> {
  /** The form's id; the submit button points at it, so it works from the footer. Keep Lightning's ids. */
  formId: string;
  /**
   * Called on submit (button or Enter), unless `submitDisabled`. May be
   * async: the modal shows pending until it settles, and if it throws the
   * modal stays open and shows the error. Close the modal yourself once it
   * resolves (`await save(); onClose()`).
   */
  onSubmit: () => void | Promise<void>;
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
  /**
   * Called with the field errors of a failed submit, instead of showing the
   * message in the modal. The form shows them on its fields.
   */
  onFieldErrors?: (fieldErrors: Record<string, string[]>) => void;
}

/**
 * A Modal wrapping one form, with the standard footer: the submit button
 * and a secondary Cancel. Enter submits; nothing happens while
 * `submitDisabled`. While `onSubmit` is pending the submit button spins,
 * Cancel and the backdrop are inert, and a failure shows as an Alert above
 * the form (STANDARDS.md patterns 1 and 2). Use Modal's `footer` directly
 * for anything else.
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
  onFieldErrors,
  onClose,
  children,
  ...modal
}: Props) {
  const submit = useAction(async () => {
    try {
      await onSubmit();
    } catch (e) {
      if (e instanceof RequestError && e.hasFieldErrors && onFieldErrors) {
        onFieldErrors(e.fieldErrors);
        return;
      }
      throw e;
    }
  });
  const close = () => {
    if (submit.pending) return;
    submit.reset();
    onClose();
  };

  return (
    <Modal
      onClose={close}
      {...modal}
      footer={
        <>
          <Button
            id={submitId}
            type="submit"
            form={formId}
            theme={submitTheme}
            disabled={submitDisabled}
            pending={submit.pending}
            tooltip={submitTooltip}
          >
            {submitLabel}
          </Button>
          <Button id={cancelId} theme="secondary" onClick={close} disabled={submit.pending}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      {before}
      {submit.error && (
        <Alert type="danger" className="mb-4" id={`${formId}-error`}>
          {errorMessage(submit.error)}
        </Alert>
      )}
      <form
        id={formId}
        className={cn(formClassName)}
        aria-busy={submit.pending || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitDisabled) void submit.run();
        }}
      >
        {children}
      </form>
    </Modal>
  );
}
