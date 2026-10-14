import { useState } from "react";

/**
 * The blue banner shown once after "Generate New Token"
 * (tokens_live/index.html.heex `data-entity="new_token"`).
 */
export default function NewTokenBanner({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(token).catch(() => {});
    setCopied(true);
  };
  return (
    <div data-entity="new_token" className="bg-blue-100">
      <div className="my-auto whitespace-nowrap font-medium text-gray-900 p-4">
        <div className="flex">
          <span className="my-auto whitespace-nowrap">
            <span className="hero-exclamation-triangle h-5 w-5" />
          </span>
          <div className="text-lg font-medium p-2">
            Make sure to copy your token now as you will not be able to see it again.
          </div>
        </div>
        <div className="flex rounded overflow-hidden p-2 bg-gray-100 w-auto justify-between">
          <input type="text" id="new_token" value={token} className="my-auto w-full border-0 bg-inherit disabled:opacity-70 mr-1" disabled />
          <span title={copied ? "Copied!" : "Copy to clipboard"}>
            <button
              id="copy"
              type="button"
              onClick={copy}
              className="rounded-full bg-blue-100 p-2 text-indigo-700 shadow-xs hover:opacity-75"
            >
              <span className="hero-clipboard h-5 w-5 block" />
              <span className="sr-only">Copy to clipboard</span>
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
