import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  Info,
  MessagesSquare,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { AssistantConversation, AssistantMessage } from "../../mock-data/assistant";
import { assistantReply, assistantSuggestions } from "../../mock-data/assistant";
import { shortId } from "../../mock-data/runs";
import CodeBlock from "../CodeBlock";
import AssistantChatInput from "./AssistantChatInput";

/** How long the prototype "thinks" before replying. */
const REPLY_DELAY_MS = 900;

const PANEL_WIDTH = "w-[400px]";

type View = "sessions" | "chat";

/**
 * The AI Assistant tray, as in Lightning's collaborative editor: a full-height
 * panel on the right of the editor that slides in and pushes the canvas (or the
 * job editor) to the left rather than covering it.
 *
 * It opens on the list of saved conversations; typing a message starts a new
 * one. With a job open (`jobLabel`) the assistant is about that job's code and
 * lists that job's conversations; otherwise it's about the whole workflow.
 * The ⋮ menu switches back to conversations and opens "About the AI Assistant".
 * When a run is selected (`runId`), its logs and data can be attached.
 *
 * `appearance="card"` draws the open tray as a rounded card with a margin,
 * standing apart from the editor beside it.
 */
export default function AIAssistantPanel({
  open,
  onClose,
  conversations: initialConversations = [],
  jobLabel,
  runId,
  author = "Jane Doe",
  defaultConversationId,
  defaultAboutOpen = false,
  defaultMenuOpen = false,
  appearance = "flush",
}: {
  open: boolean;
  onClose?: () => void;
  /** Saved conversations for this workflow, newest first. */
  conversations?: AssistantConversation[];
  /** The job open in the editor, if any. */
  jobLabel?: string;
  /** The run selected in history, if any. */
  runId?: string;
  /** Who new conversations are saved as. */
  author?: string;
  /** Open straight into a conversation (useful for stories). */
  defaultConversationId?: string;
  defaultAboutOpen?: boolean;
  defaultMenuOpen?: boolean;
  appearance?: "flush" | "card";
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState(defaultConversationId);
  const [view, setView] = useState<View>(defaultConversationId ? "chat" : "sessions");
  const [menuOpen, setMenuOpen] = useState(defaultMenuOpen);
  const [aboutOpen, setAboutOpen] = useState(defaultAboutOpen);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Opening a different job leaves a conversation about another one.
  const conversation = conversations.find((c) => c.id === conversationId && c.jobLabel === jobLabel);
  const inChat = view === "chat" && conversation !== undefined;
  const forContext = conversations.filter((c) => c.jobLabel === jobLabel);
  const listed = forContext.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()));
  const suggestions = jobLabel ? assistantSuggestions.job : assistantSuggestions.workflow;
  const placeholder = jobLabel ? "Ask me anything about this job..." : "Ask me anything about this workflow...";

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [conversation?.messages.length, loading]);

  const addMessage = (id: string, message: AssistantMessage) =>
    setConversations((current) =>
      current.map((c) => (c.id === id ? { ...c, updated: "just now", messages: [...c.messages, message] } : c))
    );

  const send = (text: string) => {
    const userMessage: AssistantMessage = { id: shortId(), role: "user", content: text.trim() };
    let id = conversation?.id;
    if (!id) {
      id = shortId();
      const created: AssistantConversation = {
        id,
        title: text.trim().slice(0, 60),
        jobLabel,
        updated: "just now",
        author,
        messages: [userMessage],
      };
      setConversations((current) => [created, ...current]);
      setConversationId(id);
      setView("chat");
    } else {
      addMessage(id, userMessage);
    }
    setLoading(true);
    const replyTo = id;
    setTimeout(() => {
      addMessage(replyTo, assistantReply(text, jobLabel));
      setLoading(false);
    }, REPLY_DELAY_MS);
  };

  const showSessions = () => {
    setConversationId(undefined);
    setView("sessions");
    setMenuOpen(false);
  };

  // Like Lightning, ✕ first leaves the conversation, then closes the tray.
  const close = () => (inChat ? showSessions() : onClose?.());

  return (
    <aside
      aria-label="AI Assistant"
      aria-hidden={!open}
      className={`flex-none overflow-hidden bg-white transition-[width] duration-300 ease-in-out ${
        appearance === "card"
          ? `my-3 mr-3 rounded-xl ${open ? `${PANEL_WIDTH} border border-gray-200 shadow-sm` : "w-0"}`
          : `h-full ${open ? `${PANEL_WIDTH} border-l border-gray-200` : "w-0"}`
      }`}
    >
      <div className={`relative flex h-full ${PANEL_WIDTH} flex-col`}>
        {/* Header */}
        <div className="flex h-14 flex-none items-center justify-between gap-2 border-b border-gray-200 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
              <Sparkles size={14} />
            </span>
            <h2 className="text-base font-semibold text-gray-900">Assistant</h2>
            {jobLabel && (
              <span className="truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600" title={jobLabel}>
                {jobLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="More options"
                aria-expanded={menuOpen}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${
                  menuOpen ? "bg-gray-100 text-gray-700" : ""
                }`}
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-64 divide-y divide-gray-100 rounded-lg bg-white shadow-xl ring-1 ring-gray-900/10"
                >
                  <div className="py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={showSessions}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 ${
                        !inChat ? "bg-blue-50 text-blue-700" : "text-gray-700"
                      }`}
                    >
                      <MessagesSquare size={18} className={!inChat ? "text-blue-600" : "text-gray-400"} />
                      <span className="flex-1 text-left">Conversations</span>
                      {!inChat && <Check size={16} className="text-blue-600" />}
                    </button>
                  </div>
                  <div className="py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAboutOpen(true);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Info size={18} className="text-gray-400" />
                      <span>About the AI Assistant</span>
                    </button>
                    <a
                      href="https://www.openfn.org/ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FileText size={18} className="text-gray-400" />
                      <span className="flex-1">Responsible AI policy</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={close}
                title={inChat ? "Close current conversation" : "Close assistant"}
                aria-label={inChat ? "Close current conversation" : "Close assistant"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Body: saved conversations, or the open one */}
        <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
          {!inChat || !conversation ? (
            <div className="space-y-4 p-4">
              {forContext.length > 0 && (
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 focus-within:border-blue-300">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations"
                    className="w-full border-0 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </label>
              )}
              {listed.length > 0 ? (
                <ul className="space-y-1">
                  {listed.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setConversationId(c.id);
                          setView("chat");
                        }}
                        className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
                      >
                        <div className="truncate text-sm font-medium text-gray-900">{c.title}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {c.author}; {c.updated}; {c.messages.length} messages
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                forContext.length > 0 && <p className="px-3 text-sm text-gray-500">No conversations match.</p>
              )}
              {forContext.length === 0 && (
                <Suggestions
                  title={jobLabel ? "Ask about this job" : "Ask about this workflow"}
                  suggestions={suggestions}
                  onPick={send}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <button
                type="button"
                onClick={showSessions}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={14} /> All conversations
              </button>
              {conversation.messages.map((m) => (
                <Message key={m.id} message={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles size={14} className="animate-pulse text-blue-500" /> Thinking...
                </div>
              )}
            </div>
          )}
        </div>

        {!inChat && forContext.length > 0 && (
          <div className="flex-none px-4 pb-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Plus size={12} /> Type below to start a new conversation
            </span>
          </div>
        )}

        <AssistantChatInput
          onSend={send}
          placeholder={placeholder}
          runId={runId}
          loading={loading}
          autoFocus={open}
        />

        {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
      </div>
    </aside>
  );
}

function Message({ message }: { message: AssistantMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md bg-blue-50 text-blue-600">
        <Sparkles size={14} />
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-sm leading-relaxed text-gray-800">
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.code && <CodeBlock code={message.code} label="Suggested code" />}
      </div>
    </div>
  );
}

function Suggestions({
  title,
  suggestions,
  onPick,
}: {
  title: string;
  suggestions: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="pt-6 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Sparkles size={20} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">Start with one of these, or type your own question below.</p>
      <div className="mt-4 flex flex-col gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function About({ onClose }: { onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="About the AI Assistant" className="absolute inset-0 z-50 flex flex-col bg-white">
      <div className="flex h-14 flex-none items-center justify-between border-b border-gray-200 px-4">
        <h3 className="text-base font-semibold text-gray-900">About the AI Assistant</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4 text-sm text-gray-800">
        <p>The OpenFn AI Assistant helps you build workflows and write job code. It can:</p>
        <ul className="list-inside list-disc space-y-1 pl-4">
          <li>Generate complete workflow templates</li>
          <li>Write and explain job code for any adaptor</li>
          <li>Debug errors and explain what went wrong</li>
          <li>Answer questions about OpenFn and adaptors</li>
          <li>Suggest improvements to your code</li>
        </ul>
        <p className="text-gray-600">
          Messages are saved unencrypted to the OpenFn database and may be monitored for quality control.
        </p>
        <h4 className="pt-2 font-semibold text-gray-900">Usage tips</h4>
        <ul className="list-inside list-disc space-y-1 pl-4">
          <li>Conversations are saved to your project and can be revisited any time</li>
          <li>
            Press <Kbd>Enter</Kbd> to send, <Kbd>Shift + Enter</Kbd> for a new line
          </li>
          <li>
            Press <Kbd>Ctrl/⌘ + K</Kbd> to open or close the assistant
          </li>
          <li>When you have a run open you can attach its logs and its data to a message</li>
        </ul>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">{children}</code>;
}
