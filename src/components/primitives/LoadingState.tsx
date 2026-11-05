import { Loader2 } from "lucide-react";

interface Props {
  /** What's loading, for screen readers and under the spinner ("Loading workflows…"). */
  label?: string;
  /** "page" fills a page's content area; "inline" sits in a section or a row. */
  size?: "page" | "inline";
}

/** A spinner while data is on its way from the server. */
export default function LoadingState({ label = "Loading…", size = "page" }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={size === "page" ? "flex flex-col items-center justify-center gap-2 py-20" : "flex items-center gap-2 py-2"}
    >
      <Loader2 size={size === "page" ? 20 : 14} className="animate-spin text-gray-400" aria-hidden />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
