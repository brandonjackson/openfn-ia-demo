import { useState } from "react";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import { focusFirstProblem } from "../primitives/focus-field";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  open: boolean;
  /** Schedules the account for deletion; rejects with a message if the email isn't yours. */
  onDelete: (email: string) => Promise<void>;
  onClose: () => void;
}

/**
 * The last check before deleting your own account: it says your credentials
 * go with it, and asks you to type your email to confirm.
 */
export default function DeleteAccountModal({ open, onDelete, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (busy) return;
    if (!email.trim()) {
      setError("Enter your email");
      focusFirstProblem([["delete-account-email", true]]);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await onDelete(email.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Delete your account"
      onClose={onClose}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {/* Enabled until it runs: pressed with no email, it says so under the field. */}
          <Button variant="danger" aria-disabled={busy} onClick={confirm}>
            {busy ? "Deleting…" : "Delete account"}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text block>
          Your account and credential data will be deleted. Please make sure none of your credentials are used in
          production workflows.
        </Text>
        <Text block tone="muted">
          If you still have activity in active projects, we may not be able to delete it entirely until those projects are
          deleted.
        </Text>
        <FormField label="Type your email to confirm" htmlFor="delete-account-email" error={error}>
          <TextInput
            id="delete-account-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
          />
        </FormField>
      </Stack>
    </Modal>
  );
}
