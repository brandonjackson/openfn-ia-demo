import { useState } from "react";
import Alert from "../Alert";
import IconButton from "../IconButton";
import { TextInput } from "../Inputs";

/**
 * The banner shown once after "Generate New Token"
 * (tokens_live/index.html.heex `data-entity="new_token"`).
 */
export default function NewTokenBanner({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(token).catch(() => {});
    setCopied(true);
  };
  return (
    <div data-entity="new_token">
      <Alert type="info" header="Make sure to copy your token now as you will not be able to see it again.">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <TextInput id="new_token" value={token} readOnly className="font-mono" />
          </div>
          <IconButton
            id="copy"
            icon={copied ? "hero-clipboard-document-check" : "hero-clipboard"}
            label={copied ? "Copied!" : "Copy to clipboard"}
            onClick={copy}
          />
        </div>
      </Alert>
    </div>
  );
}
