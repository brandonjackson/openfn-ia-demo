import { useState } from "react";
import { Check, Copy } from "lucide-react";
import IconButton from "./IconButton";

interface Props {
  value: string;
  /** Accessible name for the copy button, e.g. "Copy service code". */
  label?: string;
}

/**
 * A value to paste somewhere else, in monospace, with a button that copies
 * it and briefly shows a tick.
 */
export default function CopyValue({ value, label = "Copy" }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span className="flex min-w-0 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 py-0.5 pl-2.5 pr-0.5">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-gray-900" title={value}>
        {value}
      </code>
      <IconButton size="xs" icon={copied ? Check : Copy} label={copied ? "Copied" : label} onClick={copy} />
    </span>
  );
}
