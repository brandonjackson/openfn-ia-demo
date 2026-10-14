import { useState } from "react";
import type { AIMessage, AISession } from "../../mock-data/ai-assistant";
import { cn } from "../../utils/cn";
import Button from "../Button";
import IconButton from "../IconButton";
import Menu, { MenuDivider, MenuItem } from "../Menu";
import Modal from "../Modal";
import AIDisclaimerFooter from "./AIDisclaimerFooter";
import SearchInput from "../SearchInput";

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "just now";
  if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  if (day < 7) return `${day} ${day === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  sessions: AISession[];
  onClose: () => void;
}

/**
 * The AI Assistant side panel (`?chat=`, AIAssistantPanel.tsx with
 * SessionList, MessageList and ChatInput): 400px on the right, conversations
 * list first, then a chat. Static: sending adds your message and a canned
 * reply.
 */
export default function AIAssistantPanel({ sessions, onClose }: Props) {
  const [view, setView] = useState<"sessions" | "chat">("sessions");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, AIMessage[]>>({});
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [desc, setDesc] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  const session = sessions.find((s) => s.id === sessionId);
  const key = sessionId ?? "new";
  const messages = [...(session?.messages ?? []), ...(extra[key] ?? [])];

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setExtra((e) => ({
      ...e,
      [key]: [
        ...(e[key] ?? []),
        { id: `u-${Date.now()}`, role: "user", content: text },
        { id: `a-${Date.now()}`, role: "assistant", content: "The assistant isn't connected in this demo, so there's no real answer here." },
      ],
    }));
    setInput("");
    setView("chat");
  };

  const shown = sessions
    .filter((s) => !query || s.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (desc ? b.updatedAt.localeCompare(a.updatedAt) : a.updatedAt.localeCompare(b.updatedAt)));

  return (
    <aside
      data-testid="ai-assistant-panel"
      data-annotation="workflow-editor-ai-assistant"
      className="h-full flex flex-col overflow-hidden bg-white relative flex-none border-l border-gray-200 w-[400px]"
      aria-label="AI Assistant"
    >
      <div className="flex-none bg-white shadow-xs border-b border-gray-200">
        <div className="mx-auto px-6 py-6 flex items-center justify-between h-20 text-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src={`${import.meta.env.BASE_URL}images/logo.svg`} alt="OpenFn" className="size-6" />
            <h2 className="text-base font-semibold text-gray-900">Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <Menu className="w-64" trigger={<IconButton icon="hero-ellipsis-vertical" label="More options" />}>
              <MenuItem
                icon="hero-chat-bubble-left-right"
                selected={view === "sessions"}
                onClick={() => {
                  setView("sessions");
                  setSessionId(null);
                }}
              >
                Conversations
              </MenuItem>
              <MenuDivider />
              <MenuItem icon="hero-information-circle" onClick={() => setAboutOpen(true)}>
                About the AI Assistant
              </MenuItem>
              <MenuItem icon="hero-document-text" href="https://www.openfn.org/ai">
                <span className="inline-flex items-center gap-2">
                  Responsible AI Policy
                  <span className="hero-arrow-top-right-on-square h-4 w-4 text-gray-400" />
                </span>
              </MenuItem>
            </Menu>
            <IconButton
              icon="hero-x-mark"
              label={view === "chat" ? "Close current session" : "Close assistant"}
              onClick={() => {
                if (view === "chat") {
                  setView("sessions");
                  setSessionId(null);
                } else onClose();
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white">
        {view === "chat" ? (
          <div className="h-full overflow-y-auto px-4 py-4 space-y-4" data-testid="message-list">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 whitespace-pre-wrap">{m.content}</div>
                </div>
              ) : (
                <div key={m.id} className="text-sm text-gray-800 leading-relaxed">
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.code && (
                    <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-600">Job code</span>
                        <div className="flex gap-2">
                          <Button theme="secondary" size="sm" className="px-2 py-0.5 text-xs">
                            Copy
                          </Button>
                          <Button size="sm" className="px-2 py-0.5 text-xs">
                            Add
                          </Button>
                        </div>
                      </div>
                      <pre className="bg-slate-700 text-slate-200 text-xs font-mono p-3 overflow-x-auto">{m.code}</pre>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
              <span className="hero-chat-bubble-left-right h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">No conversations yet</h3>
            <p className="text-sm text-gray-600 text-center max-w-[280px] leading-relaxed">Start chatting below to create your first conversation</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="flex-none px-6 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <SearchInput value={query} onChange={setQuery} placeholder="Search conversations..." size="sm" className="flex-1" />
                <Button theme="secondary" size="sm" className="shrink-0" onClick={() => setDesc((d) => !d)}>
                  <span className={cn("hero-arrow-down h-3.5 w-3.5 transition-transform", !desc && "rotate-180")} />
                  {desc ? "Latest" : "Oldest"}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-3 space-y-0.5">
                {shown.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    data-testid="session-list-item"
                    onClick={() => {
                      setSessionId(s.id);
                      setView("chat");
                    }}
                    className="w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group relative hover:bg-gray-50"
                  >
                    <h4 className="text-sm font-medium truncate mb-1.5 leading-snug text-gray-700 group-hover:text-gray-900">{s.title}</h4>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs tabular-nums text-gray-500">{relative(s.updatedAt)}</span>
                      <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium tabular-nums bg-gray-100 text-gray-600">
                        {s.messages.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none border-t border-gray-200 bg-white">
        <div className="py-4 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <div className={cn("rounded-xl border-2 transition-all duration-200 bg-white", input.trim() ? "border-primary-300" : "border-gray-200 hover:border-gray-300")}>
              <textarea
                data-testid="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={view === "chat" ? "Ask a follow-up question..." : "Ask me anything about this workflow..."}
                rows={1}
                className="block w-full px-4 py-3 bg-transparent resize-none text-[15px] text-gray-900 placeholder:text-gray-400 border-0 outline-none focus:outline-none focus:ring-0"
                style={{ height: 52 }}
              />
              <div className="flex items-center justify-between gap-3 px-3 pb-2">
                <AIDisclaimerFooter />
                <IconButton
                  type="submit"
                  data-testid="send-message-button"
                  icon="hero-paper-airplane-solid"
                  label="Send message"
                  active={!!input.trim()}
                  disabled={!input.trim()}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About the AI Assistant" size="md">
        <div className="space-y-4 text-sm">
          <p>The OpenFn AI Assistant helps you build workflows and write job code. It can:</p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Generate complete workflow templates</li>
            <li>Write and explain job code for any adaptor</li>
            <li>Debug errors and explain what went wrong</li>
            <li>Answer questions about OpenFn and adaptors</li>
            <li>Suggest improvements to your code</li>
          </ul>
          <p className="text-gray-600">Messages are saved unencrypted to the OpenFn database and may be monitored for quality control.</p>
          <h4 className="pt-2 font-semibold text-gray-900">Using The Assistant Safely</h4>
          <p>
            Although we continuously monitor and improve the model, the Assistant can sometimes provide incorrect or misleading responses.
            Always review and verify the output.
          </p>
          <p>
            <strong>Important:</strong> Do not deploy auto-generated code in production without thorough testing. Do not include real user
            data, personally identifiable information, or sensitive business data in your queries.
          </p>
        </div>
      </Modal>
    </aside>
  );
}
