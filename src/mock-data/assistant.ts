import { shortId } from "./runs";

/**
 * Mock data for the AI Assistant tray in the workflow editor. Conversations
 * are saved per workflow; each one is either about the whole workflow or about
 * one job's code, like Lightning's `workflow_template` and `job_code` sessions.
 */

export type AssistantMessageRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  /** Job code or workflow YAML the assistant suggested, shown as a code block. */
  code?: string;
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

export const assistantConversations: AssistantConversation[] = [
  {
    id: "conv-duplicates",
    title: "Why does the duplicate search miss some citizens?",
    jobLabel: "Search for duplicate citizens in Identity",
    updated: "2 hours ago",
    author: "Jane Doe",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Why does the duplicate search miss some citizens? Two applicants with accents in their names got new IDs.",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "The search sends `given_name` exactly as it arrives, so \"José\" won't match \"Jose\" in Identity. Normalising the name before searching should catch those. Here's the job with that change:",
        code: `fn(state => {
  const name = state.application.given_name
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '');
  return { ...state, searchName: name };
});

get('/citizens', {
  query: { given_name: state => state.searchName },
});`,
      },
    ],
  },
  {
    id: "conv-retry",
    title: "Add a retry when Identity is down",
    updated: "Yesterday",
    author: "Jane Doe",
    messages: [
      { id: "m1", role: "user", content: "Can we retry applications automatically when Identity is down?" },
      {
        id: "m2",
        role: "assistant",
        content:
          "Yes. The workflow already sends failures from \"Create new citizen in Identity\" to \"Queue application for retry\". To retry automatically, add a cron trigger that reads the queue every 15 minutes and re-sends each application.",
      },
    ],
  },
  {
    id: "conv-sms",
    title: "Send the confirmation by SMS too",
    jobLabel: "Send confirmation notification with national ID",
    updated: "3 days ago",
    author: "Amara Okafor",
    messages: [
      { id: "m1", role: "user", content: "Can the confirmation go out by SMS as well as email?" },
      {
        id: "m2",
        role: "assistant",
        content: "Sure. Add a second request to your SMS gateway after the email, using the phone number on the application.",
      },
    ],
  },
];

/** Suggested first questions, shown when a new conversation is empty. */
export const assistantSuggestions = {
  workflow: [
    "Explain what this workflow does",
    "Add a step that logs every new application",
    "How do I test this with sample data?",
  ],
  job: ["Explain this job's code", "Why did this step fail?", "Add error handling to this job"],
};

/** A canned reply for the prototype, so a sent message gets an answer. */
export function assistantReply(prompt: string, jobLabel?: string): AssistantMessage {
  const about = jobLabel ? `the "${jobLabel}" job` : "this workflow";
  return {
    id: shortId(),
    role: "assistant",
    content: `Here's what I'd suggest for ${about}: "${prompt.trim()}" is a good place to start. In the real editor I'd read the job code, the adaptor docs and, if you attached them, the run's logs and data before answering.`,
  };
}
