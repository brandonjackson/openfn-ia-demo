import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Loader2, Send, ShieldAlert } from "lucide-react";

export interface AssistantAttachments {
  logs: boolean;
  data: boolean;
}

/**
 * The message box at the foot of the AI Assistant tray. Enter sends,
 * Shift + Enter adds a new line. While a run is open you can attach its logs
 * and its input/output data to the message, as in Lightning.
 */
export default function AssistantChatInput({
  onSend,
  placeholder = "Ask me anything...",
  runId,
  loading = false,
  autoFocus = false,
}: {
  onSend?: (message: string, attachments: AssistantAttachments) => void;
  placeholder?: string;
  /** The open run; when set, logs and data can be attached. */
  runId?: string;
  /** Shows a spinner and blocks sending while a reply is on its way. */
  loading?: boolean;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AssistantAttachments>({ logs: true, data: false });
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim() !== "" && !loading;

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const send = () => {
    if (!canSend) return;
    onSend?.(text, runId ? attachments : { logs: false, data: false });
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex-none border-t border-gray-200 bg-white p-4">
      <div
        className={`rounded-xl border-2 bg-white transition-colors ${
          text.trim() ? "border-blue-300" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {runId && (
          <div className="flex flex-wrap items-center gap-3 px-3 pt-3">
            {(
              [
                ["logs", "Attach logs", `Send the logs from run ${runId}`],
                ["data", "Attach input/output", `Send the data that went in and out of run ${runId}`],
              ] as const
            ).map(([key, label, title]) => (
              <label key={key} title={title} className="group flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={attachments[key]}
                  onChange={() => setAttachments((a) => ({ ...a, [key]: !a[key] }))}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600"
                />
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
              </label>
            ))}
          </div>
        )}

        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={2}
          className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
        />

        <div className="flex items-center justify-between gap-3 px-3 pb-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
            <ShieldAlert size={14} className="shrink-0 text-amber-500" />
            <span>
              Please use AI responsibly. Never share PII.{" "}
              <a
                href="https://www.openfn.org/ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-900"
              >
                Learn more.
              </a>
            </span>
          </span>
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label={loading ? "Sending..." : "Send message"}
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
              canSend ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
