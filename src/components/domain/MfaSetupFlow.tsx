import { useState } from "react";
import { isTotpCode, type MfaSetup } from "../../model/account";
import Button from "../primitives/Button";
import CopyValue from "../primitives/CopyValue";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Inline from "../primitives/Inline";
import QrCode from "../primitives/QrCode";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The new secret, from the server, as a QR code and as text. */
  setup: MfaSetup;
  /** Checks a code from the app and turns MFA on; rejects with a message if the code is wrong. */
  onVerify: (code: string) => Promise<void>;
  /** Stops setting up, leaving MFA as it was. */
  onCancel: () => void;
}

/**
 * Setting up an authenticator app, as Lightning does it: scan the QR code
 * (or type the secret key), then type the six-digit code the app shows to
 * prove it works.
 */
export default function MfaSetupFlow({ setup, onVerify, onCancel }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    if (!isTotpCode(code)) {
      setError("Enter the 6-digit code from your app");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await onVerify(code.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap="lg">
      <section>
        <SectionHeading variant="label" compact title="Authenticator app" />
        <Text block tone="muted">
          Authenticator apps and browser extensions like 1Password and Authy generate one-time passwords that are used as
          a second factor to verify your identity when prompted during sign-in.
        </Text>
      </section>
      <section>
        <SectionHeading variant="label" compact title="Scan the QR code" />
        <Inline gap="lg" align="start" wrap>
          <QrCode value={setup.uri} label="QR code for your authenticator app" size={144} />
          <Stack gap="sm">
            <Text block tone="muted">
              Use an authenticator app or browser extension to scan it.
            </Text>
            <Text block tone="muted">
              Unable to scan? Type this secret key into your app instead.
            </Text>
            <CopyValue value={setup.secret} label="Copy secret key" />
          </Stack>
        </Inline>
      </section>
      <FormField label="Verify the code from the app" htmlFor="mfa-code" required error={error}>
        <TextInput
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="XXXXXX"
          maxLength={6}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(undefined);
          }}
        />
      </FormField>
      <Inline justify="end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={busy} onClick={verify}>
          {busy ? "Verifying…" : "Verify and turn on"}
        </Button>
      </Inline>
    </Stack>
  );
}
