import { useState } from "react";
import Alert from "../Alert";
import Button from "../Button";
import type { BackupCode } from "../../mock-data/tokens";

/**
 * The recovery codes card (backup_codes_live/index.html.heex): the codes
 * (used ones struck through), Print and Copy, and "Generate new backup codes".
 */
export default function BackupCodesCard({ codes, onRegenerate }: { codes: BackupCode[]; onRegenerate?: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(codes.map((c) => c.code).join("\n\n")).catch(() => {});
    setCopied(true);
  };
  return (
    <div className="bg-white shadow-xs ring-1 ring-gray-900/5 rounded-md">
      <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 rounded-t-md">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Backup Codes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Keep your backup codes as safe as your password. We recommend saving them with a password manager.
        </p>
      </div>
      <Alert type="warning">
        Keep your recovery codes in a safe spot. These codes are the last resort for accessing your account in case
        you lose your authenticator device.
      </Alert>
      <div className="grid md:grid-cols-2 gap-4 px-4 sm:px-6 py-4 border-t border-gray-300">
        {codes.map((c) => (
          <div key={c.code} className="text-center tracking-widest">
            {c.usedAt ? (
              <span className="text-sm text-gray-300">
                <span className="line-through">{c.code}</span>
                <span className="relative ml-1 cursor-pointer inline-block" title={`Code used on ${c.usedAt.slice(0, 19).replace("T", " ")}`}>
                  <span className="hero-information-circle-solid w-4 h-4 text-primary-600 opacity-50" />
                </span>
              </span>
            ) : (
              c.code
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-4 px-4 py-5 sm:px-6 border-t border-gray-300">
        <Button theme="secondary" size="lg" onClick={() => window.print()}>
          <span className="hero-printer -ml-0.5 h-5 w-5" />
          Print Codes
        </Button>
        <div className="flex justify-center items-center gap-x-2">
          <Button id="copy-codes-button" theme="secondary" size="lg" onClick={copy}>
            <span className="hero-document-duplicate -ml-0.5 h-5 w-5" />
            Copy Codes
          </Button>
          {copied && (
            <Alert id="codes-copied-alert" type="success" className="p-2">
              Copied!
            </Alert>
          )}
        </div>
      </div>
      <div className="border-t border-gray-300 bg-white px-4 py-5 sm:px-6 rounded-b-md">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Generate new backup codes</h3>
        <p className="mt-1 text-sm text-gray-500">
          When you generate new backup codes, you must copy or print the new codes. Your old codes won't work anymore.
        </p>
        <div className="mt-2">
          <Button theme="secondary" size="lg" onClick={onRegenerate}>
            Generate new backup codes
          </Button>
        </div>
      </div>
    </div>
  );
}
