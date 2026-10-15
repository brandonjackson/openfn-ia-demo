import Alert from "../Alert";
import Button from "../Button";
import Card from "../Card";
import InfoTooltip from "../InfoTooltip";
import SectionHeader from "../SectionHeader";
import type { BackupCode } from "../../mock-data/tokens";
import { useCopy } from "../../utils/useCopy";

/**
 * The recovery codes card (backup_codes_live/index.html.heex): the codes
 * (used ones struck through), Print and Copy, and "Generate new backup codes".
 */
export default function BackupCodesCard({ codes, onRegenerate }: { codes: BackupCode[]; onRegenerate?: () => void }) {
  const { copied, copy } = useCopy(codes.map((c) => c.code).join("\n\n"));
  return (
    <Card padding="none" className="divide-y divide-gray-300">
      <div className="p-6">
        <SectionHeader
          title="Backup Codes"
          subtitle="Keep your backup codes as safe as your password. We recommend saving them with a password manager."
        />
      </div>
      <Alert type="warning">
        Keep your recovery codes in a safe spot. These codes are the last resort for accessing your account in case
        you lose your authenticator device.
      </Alert>
      <div className="grid gap-4 p-6 text-center tracking-widest md:grid-cols-2">
        {codes.map((c) =>
          c.usedAt ? (
            <span key={c.code} className="text-sm text-gray-300">
              <span className="line-through">{c.code}</span>
              <InfoTooltip title={`Code used on ${c.usedAt.slice(0, 19).replace("T", " ")}`} />
            </span>
          ) : (
            <span key={c.code}>{c.code}</span>
          )
        )}
      </div>
      <div className="flex items-center justify-center gap-4 p-6">
        <Button theme="secondary" size="lg" onClick={() => window.print()}>
          <span className="hero-printer h-5 w-5" />
          Print Codes
        </Button>
        <Button id="copy-codes-button" theme="secondary" size="lg" onClick={copy}>
          <span className="hero-document-duplicate h-5 w-5" />
          Copy Codes
        </Button>
        {copied && (
          <Alert id="codes-copied-alert" type="success" className="p-2">
            Copied!
          </Alert>
        )}
      </div>
      <div className="p-6">
        <SectionHeader
          title="Generate new backup codes"
          subtitle="When you generate new backup codes, you must copy or print the new codes. Your old codes won't work anymore."
          action={
            <Button theme="secondary" size="lg" onClick={onRegenerate}>
              Generate new backup codes
            </Button>
          }
        />
      </div>
    </Card>
  );
}
