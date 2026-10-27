import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Info, MessagesSquare, MoreVertical, Plus, Sparkles, X, Zap } from "lucide-react";
import type { AssistantConversation, AssistantMessage, AssistantMode, AssistantPlan, AssistantReference } from "../../mock-data/assistant";
import { assistantPlanResult, assistantReply, assistantSuggestions } from "../../mock-data/assistant";
import { shortId } from "../../mock-data/runs";
import CodeBlock from "../CodeBlock";
import DropdownMenu from "../DropdownMenu";
import AssistantChatInput from "./AssistantChatInput";
import AssistantPlanCard from "./AssistantPlanCard";
import AssistantResultCard from "./AssistantResultCard";
import EntityPill from "../EntityPill";
import IconButton from "../IconButton";
import SearchInput from "../SearchInput";

/** How long the prototype "thinks" before replying. */
const REPLY_DELAY_MS = 900;

type View = "sessions" | "chat";

/**
 * The assistant's body, shown inside an {@link EditorTray}: saved
 * conversations for the workflow (or for the open step), and the open one.
 *
 * It opens on the list of saved conversations; typing a message starts a new
 * one. With a step open (`jobLabel`) the assistant is about that step's code
 * and lists that step's conversations; otherwise it's about the whole
 * workflow. In Plan mode the assistant proposes a plan to approve; in Build
 * mode it makes the change and reports the result, from which the test runs
 * can be opened and a merge requested. The ⋮ menu switches back to
 * conversations and opens "About the assistant". When a run is selected
 * (`runId`), its logs and data can be attached. A `reference`, e.g. the step
 * whose card's Improve opened the assistant, is loaded into the chat input
 * and goes out with the next message.
 */
export default function AIAssistantPanel({
  conversations: initialConversations = [],
  jobLabel,
  runId,
  author = "Jane Doe",
  defaultConversationId,
  defaultAboutOpen = false,
  defaultMode = "plan",
  onOpenRuns,
  onAskToMerge,
  onPlanAccepted,
  reference,
  onClearReference,
}: {
  /** Saved conversations for this workflow, newest first. */
  conversations?: AssistantConversation[];
  /** The step open in the editor, if any. */
  jobLabel?: string;
  /** The run selected in history, if any. */
  runId?: string;
  /** Who new conversations are saved as. */
  author?: string;
  /** Open straight into a conversation (useful for stories). */
  defaultConversationId?: string;
  defaultAboutOpen?: boolean;
  defaultMode?: AssistantMode;
  /** "Open runs" on a result card. */
  onOpenRuns?: () => void;
  /** "Ask to merge" on a result card; unset on main. */
  onAskToMerge?: () => void;
  /** A plan was accepted; the editor can reflect the change. */
  onPlanAccepted?: (plan: AssistantPlan) => void;
  /** Context loaded into the chat input, e.g. a step picked on the canvas. */
  reference?: AssistantReference;
  /** The reference was sent or removed. */
  onClearReference?: () => void;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState(defaultConversationId);
  const [view, setView] = useState<View>(defaultConversationId ? "chat" : "sessions");
  const [aboutOpen, setAboutOpen] = useState(defaultAboutOpen);
  const [mode, setMode] = useState<AssistantMode>(defaultMode);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  // Opening a different job leaves a conversation about another one.
  const conversation = conversations.find((c) => c.id === conversationId && c.jobLabel === jobLabel);
  const inChat = view === "chat" && conversation !== undefined;
  const forContext = conversations.filter((c) => c.jobLabel === jobLabel);
  const listed = forContext.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()));
  const suggestions = jobLabel ? assistantSuggestions.job : assistantSuggestions.workflow;
  const placeholder = reference
    ? `What should be better about this ${reference.kind}?`
    : jobLabel
      ? `Ask for a change to ${jobLabel}…`
      : "Ask for a change, or describe what to build…";

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [conversation?.messages.length, loading]);

  const addMessage = (id: string, message: AssistantMessage) =>
    setConversations((current) =>
      current.map((c) => (c.id === id ? { ...c, updated: "just now", messages: [...c.messages, message] } : c))
    );

  /** Mark a plan accepted or declined, and reply with the result when accepted. */
  const resolvePlan = (messageId: string, status: "accepted" | "declined") => {
    if (!conversation) return;
    const message = conversation.messages.find((m) => m.id === messageId);
    if (!message?.plan) return;
    const plan = { ...message.plan, status };
    setConversations((current) =>
      current.map((c) =>
        c.id === conversation.id ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, plan } : m)) } : c
      )
    );
    if (status !== "accepted") return;
    onPlanAccepted?.(plan);
    setLoading(true);
    const id = conversation.id;
    setTimeout(() => {
      addMessage(id, assistantPlanResult(plan));
      setLoading(false);
    }, REPLY_DELAY_MS);
  };

  const send = (text: string) => {
    const userMessage: AssistantMessage = { id: shortId(), role: "user", content: text.trim(), reference };
    if (reference) onClearReference?.();
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
      addMessage(replyTo, assistantReply(text, jobLabel, mode));
      setLoading(false);
    }, REPLY_DELAY_MS);
  };

  const showSessions = () => {
    setConversationId(undefined);
    setView("sessions");
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
        {/* Context: what the assistant is about, and the ⋮ menu */}
        <div className="flex h-9 flex-none items-center justify-between gap-2 px-4">
          <span className="truncate text-xs text-gray-500" title={jobLabel}>
            {jobLabel ? (
              <>
                About <span className="font-medium text-gray-700">{jobLabel}</span>
              </>
            ) : (
              "About this workflow"
            )}
          </span>
          <DropdownMenu
            ariaLabel="Assistant options"
            align="right"
            items={[
              { id: "sessions", label: "Conversations", icon: MessagesSquare, selected: !inChat },
              { id: "about", label: "About the assistant", icon: Info, divider: true },
              { id: "policy", label: "Responsible AI policy", icon: FileText },
            ]}
            onSelect={(id) => {
              if (id === "sessions") showSessions();
              else if (id === "about") setAboutOpen(true);
              else window.open("https://www.openfn.org/ai", "_blank", "noopener,noreferrer");
            }}
            trigger={({ open, toggle }) => (
              <IconButton
                icon={MoreVertical}
                label="More options"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                active={open}
              />
            )}
          />
        </div>

        {/* Body: saved conversations, or the open one */}
        <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
          {!inChat || !conversation ? (
            <div className="space-y-4 p-4">
              {forContext.length > 0 && (
                <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" />
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
                <Message
                  key={m.id}
                  message={m}
                  onAcceptPlan={() => resolvePlan(m.id, "accepted")}
                  onDeclinePlan={() => resolvePlan(m.id, "declined")}
                  onOpenRuns={onOpenRuns}
                  onAskToMerge={onAskToMerge}
                />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles size={14} className="animate-pulse text-indigo-500" /> Thinking...
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
          autoFocus
          mode={mode}
          onModeChange={setMode}
          reference={reference}
          onRemoveReference={onClearReference}
        />

        {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function Message({
  message,
  onAcceptPlan,
  onDeclinePlan,
  onOpenRuns,
  onAskToMerge,
}: {
  message: AssistantMessage;
  onAcceptPlan?: () => void;
  onDeclinePlan?: () => void;
  onOpenRuns?: () => void;
  onAskToMerge?: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-gray-900">
        {message.reference && (
          <div className="mb-1.5">
            <EntityPill
              name={message.reference.label}
              adaptor={message.reference.adaptor}
              icon={message.reference.adaptor ? undefined : <Zap size={12} className="text-indigo-500" />}
              shape="tag"
              size="sm"
              tone="accent"
            />
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-sm leading-relaxed text-gray-800">
      <p className="whitespace-pre-wrap">{message.content}</p>
      {message.code && <CodeBlock code={message.code} label="Suggested code" />}
      {message.plan && <AssistantPlanCard plan={message.plan} onAccept={onAcceptPlan} onEdit={onDeclinePlan} />}
      {message.result && <AssistantResultCard result={message.result} onOpenRuns={onOpenRuns} onAskToMerge={onAskToMerge} />}
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
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
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
            className="rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
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
        <IconButton size="md" icon={X} label="Close" onClick={onClose} />
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
