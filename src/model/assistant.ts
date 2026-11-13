/**
 * Mock data for the AI Assistant tray in the workflow editor. Conversations
 * are saved per workflow; each one is either about the whole workflow or about
 * one job's code, like Lightning's `workflow_template` and `job_code` sessions.
 */
import type { AdaptorKind } from "./workflow";

export type AssistantMessageRole = "user" | "assistant";

/**
 * How the assistant works on a request: answer in words, propose a plan to
 * approve first, or make the change straight away.
 */
export type AssistantMode = "ask" | "plan" | "build";

export const assistantModes: { id: AssistantMode; label: string; description: string }[] = [
  { id: "plan", label: "Plan", description: "Proposes the changes and waits for you to approve them." },
  { id: "build", label: "Build", description: "Makes the change and tests it, then shows you the result." },
  { id: "ask", label: "Ask", description: "Answers in words, without touching the workflow." },
];

/** A plan the assistant proposes before changing anything. */
export interface AssistantPlan {
  steps: string[];
  /** Set once the plan has been carried out or turned down. */
  status?: "accepted" | "declined";
}

/** The outcome of changes the assistant made and tested. */
export interface AssistantResult {
  items: { label: string; outcome: "ok" | "skipped" | "failed" }[];
  /** What it's about: a change it made and test-ran (the default), or the test cases it wrote, which opens them instead of the runs. */
  about?: "change" | "tests";
}

/**
 * Something in the editor a message is about, attached to the chat input as
 * context: a step or the trigger, with the adaptor for the chip's icon.
 */
export interface AssistantReference {
  kind: "step" | "trigger";
  /** The node's id in the workflow. */
  id: string;
  label: string;
  adaptor?: AdaptorKind;
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  /** What the message was about, when it was sent with a reference attached. */
  reference?: AssistantReference;
  /** Job code or workflow YAML the assistant suggested, shown as a code block. */
  code?: string;
  plan?: AssistantPlan;
  result?: AssistantResult;
}

export interface AssistantConversation {
  id: string;
  title: string;
  /** The job the conversation is about; unset for whole-workflow conversations. */
  jobLabel?: string;
  /** e.g. "2 hours ago". */
  updated: string;
  author: string;
  messages: AssistantMessage[];
}

/** Suggested first questions for a new conversation: about the whole workflow, or about one step. */
export interface AssistantSuggestions {
  workflow: string[];
  job: string[];
}
