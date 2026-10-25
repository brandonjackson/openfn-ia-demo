import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ArrowUp, ChevronDown, Loader2, Plus } from "lucide-react";
import type { AssistantMode } from "../../mock-data/assistant";
import { assistantModes } from "../../mock-data/assistant";
import DropdownMenu from "../DropdownMenu";

export interface AssistantAttachments {
  logs: boolean;
  data: boolean;
}

/**
 * The message box at the foot of the assistant tray. Enter sends,
 * Shift + Enter adds a new line. The mode picker chooses how the assistant
 * works on the request (plan first, build straight away, or just answer).
 * While a run is open, the + button attaches its logs and data.
 */
export default function AssistantChatInput({
  onSend,
  placeholder = "Ask for a change, or describe what to build…",
  runId,
  loading = false,
  autoFocus = false,
  mode = "plan",
  onModeChange,
}: {
  onSend?: (message: string, attachments: AssistantAttachments, mode: AssistantMode) => void;
  placeholder?: string;
  /** The open run; when set, logs and data can be attached. */
  runId?: string;
  /** Shows a spinner and blocks sending while a reply is on its way. */
  loading?: boolean;
  autoFocus?: boolean;
  mode?: AssistantMode;
  onModeChange?: (mode: AssistantMode) => void;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AssistantAttachments>({ logs: false, data: false });
  const [attachOpen, setAttachOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim() !== "" && !loading;
  const attached = [attachments.logs && "logs", attachments.data && "data"].filter(Boolean) as string[];

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const send = () => {
    if (!canSend) return;
    onSend?.(text, runId ? attachments : { logs: false, data: false }, mode);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex-none bg-white px-4 pb-2 pt-3">
      <div
        className={`rounded-xl border bg-white transition-colors ${
          text.trim() ? "border-gray-400" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={2}
          className="block w-full resize-none border-0 bg-transparent px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />

        <div className="flex items-center gap-1.5 px-2 pb-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => runId && setAttachOpen((o) => !o)}
              disabled={!runId}
              aria-label={runId ? "Attach run logs or data" : "Select a run to attach its logs or data"}
              title={runId ? `Attach from run ${runId.slice(0, 6)}` : "Select a run to attach its logs or data"}
              aria-expanded={attachOpen}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 ${
                attached.length > 0 ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              <Plus size={16} />
            </button>
            {attachOpen && runId && (
              <div className="absolute bottom-full left-0 z-50 mb-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <p className="px-1 pb-1 text-xs text-gray-500">Attach from run {runId.slice(0, 6)}</p>
                {(
                  [
                    ["logs", "Logs"],
                    ["data", "Input and output"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm text-gray-700 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={attachments[key]}
                      onChange={() => setAttachments((a) => ({ ...a, [key]: !a[key] }))}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu
            ariaLabel="Assistant mode"
            items={assistantModes.map((m) => ({ id: m.id, label: m.label, description: m.description, selected: m.id === mode }))}
            onSelect={(id) => onModeChange?.(id as AssistantMode)}
            widthClass="w-72"
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-gray-100 px-2.5 text-sm font-medium text-gray-800 hover:bg-gray-200"
              >
                {assistantModes.find((m) => m.id === mode)?.label}
                <ChevronDown size={12} className="text-gray-500" />
              </button>
            )}
          />
          {attached.length > 0 && <span className="text-xs text-gray-500">+ {attached.join(" and ")}</span>}
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label={loading ? "Sending..." : "Send message"}
            className={`ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
              canSend ? "bg-gray-900 text-white hover:bg-gray-800" : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
          </button>
        </div>
      </div>
      <p className="pt-2 text-center text-[11px] text-gray-400">
        Do not include personal or sensitive data.{" "}
        <a href="https://www.openfn.org/ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          Learn more
        </a>
      </p>
    </div>
  );
}
