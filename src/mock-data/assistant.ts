import { shortId } from "./runs";

/**
 * Mock data for the AI Assistant tray in the workflow editor. Conversations
 * are saved per workflow; each one is either about the whole workflow or about
 * one job's code, like Lightning's `workflow_template` and `job_code` sessions.
 */

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
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
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

export const assistantConversations: AssistantConversation[] = [
  {
    id: "conv-consent",
    title: "Only save submissions where the person gave consent",
    jobLabel: "Create new citizen in Identity",
    updated: "10 minutes ago",
    author: "Jane Doe",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Only save submissions where the person gave consent. Skip the rest.",
      },
      {
        id: "m2",
        role: "assistant",
        content: "Here's what I'll change. Nothing is edited until you say so.",
        plan: {
          steps: [
            "Check consent at the start of Create new citizen in Identity",
            "Skip Send confirmation notification when there's no consent",
            "Test with the last 3 applications",
          ],
          status: "accepted",
        },
      },
      {
        id: "m3",
        role: "assistant",
        content:
          "Changes accepted.\n\nI tested it with the last 3 applications: 2 were saved, and 1 was skipped because consent was \"no\". Identity wasn't called for that one.",
        result: {
          items: [
            { label: "2 saved", outcome: "ok" },
            { label: "1 skipped", outcome: "skipped" },
          ],
        },
      },
    ],
  },
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
export function assistantReply(prompt: string, jobLabel?: string, mode: AssistantMode = "plan"): AssistantMessage {
  const about = jobLabel ? `the "${jobLabel}" step` : "this workflow";
  const ask = prompt.trim().replace(/[.?!]+$/, "");
  if (mode === "plan") {
    return {
      id: shortId(),
      role: "assistant",
      content: "Here's what I'll change. Nothing is edited until you say so.",
      plan: {
        steps: [
          jobLabel ? `Update ${jobLabel} so that it will ${ask.toLowerCase()}` : `Add a step that will ${ask.toLowerCase()}`,
          "Keep the rest of the workflow as it is",
          "Test with the last 3 runs' inputs",
        ],
      },
    };
  }
  if (mode === "build") {
    return {
      id: shortId(),
      role: "assistant",
      content: `Done. I changed ${about} to ${ask.toLowerCase()} and tested it with the last 3 runs' inputs.`,
      result: { items: [{ label: "3 passed", outcome: "ok" }] },
    };
  }
  return {
    id: shortId(),
    role: "assistant",
    content: `Here's what I'd suggest for ${about}: "${prompt.trim()}" is a good place to start. In the real editor I'd read the job code, the adaptor docs and, if you attached them, the run's logs and data before answering.`,
  };
}

/** The result message once a proposed plan is carried out. */
export function assistantPlanResult(plan: AssistantPlan): AssistantMessage {
  return {
    id: shortId(),
    role: "assistant",
    content: `Changes accepted.\n\nI made the ${plan.steps.length} changes and tested them with the last 3 runs' inputs: all 3 passed.`,
    result: { items: [{ label: "3 passed", outcome: "ok" }] },
  };
}
