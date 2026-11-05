import { useState } from "react";
import type { UserCredential } from "../../model/page-data";
import { emailError } from "../../model/credentials";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  open: boolean;
  /** The credential to hand over. With a transfer pending, the dialog offers to revoke it instead. */
  credential: Pick<UserCredential, "name" | "transferPendingTo">;
  /**
   * Starts handing it to the person with this email, who accepts from a link
   * we email them. Rejects with a message to show (no such person, not in
   * every project that uses it, or yourself).
   */
  onTransfer: (email: string) => Promise<void>;
  /** Cancels the pending transfer, so it stays yours. */
  onRevoke: () => Promise<void>;
  onClose: () => void;
}

/**
 * Lightning's transfer flow for a credential: enter the new owner's email,
 * and they get a link to accept it. The new owner must be in every project
 * that uses the credential. While a transfer waits, the same dialog revokes it.
 */
export default function TransferCredentialModal({ open, credential, onTransfer, onRevoke, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const pending = credential.transferPendingTo;
  const formatError = touched ? emailError(email) : undefined;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setServerError(undefined);
    try {
      await action();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (pending)
    return (
      <Modal
        open={open}
        title="Revoke credential transfer"
        onClose={onClose}
        widthClass="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={() => run(onRevoke)}>
              {busy ? "Revoking…" : "Revoke"}
            </Button>
          </>
        }
      >
        <Stack gap="sm">
          <Text block>
            "{credential.name}" is waiting for {pending} to accept it.
          </Text>
          <Text block tone="muted">
            Revoking cancels the request and keeps the credential yours. To hand it over later, start a new transfer.
          </Text>
          {serverError && <Text tone="danger">{serverError}</Text>}
        </Stack>
      </Modal>
    );

  return (
    <Modal
      open={open}
      title="Transfer credential ownership"
      onClose={onClose}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={busy || Boolean(emailError(email))}
            onClick={() => {
              setTouched(true);
              if (!emailError(email)) void run(() => onTransfer(email.trim()));
            }}
          >
            {busy ? "Transferring…" : "Transfer"}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text block>
          Enter the email address of the new owner of "{credential.name}". They must be a member of every project where
          this credential is used.
        </Text>
        <FormField label="New owner's email" htmlFor="transfer-email" required error={serverError ?? formatError}>
          <TextInput
            id="transfer-email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setServerError(undefined);
            }}
            onBlur={() => setTouched(true)}
          />
        </FormField>
      </Stack>
    </Modal>
  );
}
