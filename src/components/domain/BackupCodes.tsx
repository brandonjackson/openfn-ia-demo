import { useState } from "react";
import { Check, Copy, Printer, RefreshCw } from "lucide-react";
import type { BackupCode } from "../../model/page-data";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import ConfirmModal from "../primitives/ConfirmModal";
import Grid from "../primitives/Grid";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  codes: BackupCode[];
  /** Replaces every code with new ones; the old ones stop working. */
  onRegenerate: () => Promise<void>;
  /** Says the codes are new and must be saved now, e.g. straight after turning MFA on. */
  fresh?: boolean;
}

/** Opens the codes on their own in a new window and prints them. */
function printCodes(codes: BackupCode[]) {
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;
  const doc = win.document;
  doc.title = "OpenFn backup codes";
  const heading = doc.createElement("h1");
  heading.textContent = "OpenFn backup codes";
  const list = doc.createElement("pre");
  list.textContent = codes.filter((c) => !c.usedAt).map((c) => c.code).join("\n\n");
  doc.body.append(heading, list);
  win.focus();
  win.print();
}

/**
 * Your multi-factor backup codes, the last resort if you lose your
 * authenticator device: each works once, and a used one says when. Copy or
 * print them, or generate a new set, which stops the old ones working.
 */
export default function BackupCodes({ codes, onRegenerate, fresh = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copy = () => {
    void navigator.clipboard?.writeText(codes.map((c) => c.code).join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Stack gap="md">
      <Text block tone="muted">
        Recovery codes can be used to access your account in the event you lose access to your device and cannot receive
        two-factor authentication codes.
      </Text>
      <Callout variant="warning" title={fresh ? "Save these codes now" : "Keep your recovery codes in a safe spot"}>
        These codes are the last resort for accessing your account in case you lose your authenticator device. Keep them as
        safe as your password; we recommend a password manager.
      </Callout>
      <Grid columns={5} gap="sm">
        {codes.map((c) =>
          c.usedAt ? (
            <Stack key={c.code} gap="none">
              <Text mono tone="subtle">
                {c.code}
              </Text>
              <Text size="xs" tone="subtle">
                Used {c.usedAt}
              </Text>
            </Stack>
          ) : (
            <Text key={c.code} mono tone="strong">
              {c.code}
            </Text>
          )
        )}
      </Grid>
      <Inline gap="sm" wrap>
        <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? "Copied" : "Copy codes"}
        </Button>
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => printCodes(codes)}>
          Print codes
        </Button>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setConfirming(true)}>
          Generate new codes
        </Button>
      </Inline>
      <ConfirmModal
        open={confirming}
        title="Generate new backup codes"
        tone="primary"
        confirmLabel="Generate new codes"
        onClose={() => setConfirming(false)}
        onConfirm={async () => {
          await onRegenerate();
          setConfirming(false);
        }}
      >
        <p>When you generate new backup codes, you must copy or print the new codes. Your old codes won't work anymore.</p>
      </ConfirmModal>
    </Stack>
  );
}
