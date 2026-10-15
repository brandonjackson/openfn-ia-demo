import { useState } from "react";
import type { AIMessage, AISession } from "../../types/ai-assistant";
import { cn } from "../../utils/cn";
import Button from "../Button";
import Card from "../Card";
import CopyButton from "../CopyButton";
import Heading from "../Heading";
import IconButton from "../IconButton";
import Menu, { MenuDivider, MenuItem } from "../Menu";
import Modal from "../Modal";
import AIDisclaimerFooter from "./AIDisclaimerFooter";
import Pill from "../Pill";
import SearchInput from "../SearchInput";
import { matchesQuery } from "../../utils/search";
import { formatSessionAge } from "../../utils/format";

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
    .filter((s) => matchesQuery(query, s.title))
    .sort((a, b) => (desc ? b.updatedAt.localeCompare(a.updatedAt) : a.updatedAt.localeCompare(b.updatedAt)));

  return (
    <aside
      data-testid="ai-assistant-panel"
      data-annotation="workflow-editor-ai-assistant"
      className="flex h-full w-100 flex-none flex-col overflow-hidden border-l border-gray-200 bg-white"
      aria-label="AI Assistant"
    >
      <div className="flex h-20 flex-none items-center gap-2 border-b border-gray-200 px-6 shadow-xs">
        <img src={`${import.meta.env.BASE_URL}images/logo.svg`} alt="OpenFn" className="size-6" />
        <Heading as="h2" className="flex-1">
          Assistant
        </Heading>
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

      <div className="flex-1 overflow-hidden">
        {view === "chat" ? (
          <div className="h-full space-y-4 overflow-y-auto p-4 text-sm" data-testid="message-list">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-5/6 whitespace-pre-wrap rounded-2xl bg-gray-100 px-4 py-2.5 text-gray-900">{m.content}</div>
                </div>
              ) : (
                <div key={m.id} className="leading-relaxed text-gray-800">
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.code && (
                    <Card padding="none" className="mt-3 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5">
                        <Heading size="eyebrow" as="p" className="flex-1">
                          Job code
                        </Heading>
                        <CopyButton value={m.code} size="xs">
                          Copy
                        </CopyButton>
                        <Button size="xs">Add</Button>
                      </div>
                      <pre className="overflow-x-auto bg-gray-700 p-3 font-mono text-xs text-gray-200">{m.code}</pre>
                    </Card>
                  )}
                </div>
              )
            )}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="mb-2 rounded-full bg-gray-100 p-5">
              <span className="hero-chat-bubble-left-right block h-10 w-10 text-gray-400" />
            </div>
            <Heading size="lg">No conversations yet</Heading>
            <p className="max-w-70 text-sm text-gray-600">Start chatting below to create your first conversation</p>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-6 pt-3 pb-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search conversations..." size="sm" className="flex-1" />
              <Button theme="secondary" size="sm" onClick={() => setDesc((d) => !d)}>
                <span className={cn("hero-arrow-down h-3.5 w-3.5 transition-transform", !desc && "rotate-180")} />
                {desc ? "Latest" : "Oldest"}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-0.5 p-3">
                {shown.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    data-testid="session-list-item"
                    onClick={() => {
                      setSessionId(s.id);
                      setView("chat");
                    }}
                    className="w-full rounded-lg p-3 text-left hover:bg-gray-50"
                  >
                    <Heading size="sm" as="h4" className="mb-1.5 truncate">
                      {s.title}
                    </Heading>
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                      {formatSessionAge(s.updatedAt)}
                      <Pill>{s.messages.length}</Pill>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className={cn("rounded-xl border-2", input.trim() ? "border-primary-300" : "border-gray-200 hover:border-gray-300")}>
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
              className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
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
          <Heading size="sm" as="h4" className="pt-2">
            Using The Assistant Safely
          </Heading>
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
