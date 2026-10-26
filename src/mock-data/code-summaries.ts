/**
 * What the assistant says a step's code does, for the inspector. The national
 * ID workflow's steps have a written summary; any other step (or one whose
 * code has been edited this session) gets one put together from the
 * operations its code calls.
 */
import type { JobNode } from "./workflow";
import { adaptorInfo } from "./adaptor-reference";

/** Summaries of the national ID workflow's steps, as first loaded. */
const written: Record<string, { body: string; points: string[] }> = {
  search: {
    body: "fn(state => {\n  state.application = state.data;",
    points: [
      "Keeps the original application on state so later steps can use it.",
      "Searches Identity's citizen register by the applicant's given name and date of birth.",
      "Compares the results with the application and sets `exactMatch`, which decides whether the run goes on to notify the applicant or create a new citizen.",
    ],
  },
  notify: {
    body: "post('https://.../notify', state => ({ body: state.match }))",
    points: ["Posts the matching citizen record to the notification service, telling the applicant they already have a national ID."],
  },
  create: {
    body: "post('https://.../citizens', state => ({ body: state.application }))",
    points: ["Posts the application to Identity to register a new citizen.", "Identity's response, with the issued national ID, becomes the next step's input."],
  },
  queue: {
    body: "fn(state => state);",
    points: ["Passes state through unchanged, so the application is kept and can be retried once Identity is reachable again."],
  },
  confirm: {
    body: "post('https://.../notify', state => ({ body: state.nationalId }))",
    points: ["Posts the newly issued national ID to the notification service so the applicant receives it."],
  },
};

const verbs: Record<string, string> = {
  get: "Fetches data with a GET request",
  post: "Sends data with a POST request",
  put: "Updates data with a PUT request",
  patch: "Updates data with a PATCH request",
  del: "Deletes data",
  fn: "Transforms state with custom JavaScript",
  each: "Repeats an operation for each item",
  sql: "Runs a SQL query",
  insert: "Inserts records",
  upsert: "Creates or updates records",
  create: "Creates records",
  update: "Updates records",
};

/**
 * A short, plain-language summary of what `job`'s code does, one point per
 * thing it does.
 */
export function codeSummary(job: JobNode): string[] {
  const known = written[job.id];
  if (known && job.body.includes(known.body)) return known.points;

  // The operations called at the top level of the code, in order, once each.
  const calls = [...job.body.matchAll(/^([a-zA-Z]\w*)\(/gm)].map((m) => m[1]);
  const points = [...new Set(calls)].map((op) => `${verbs[op] ?? `Calls \`${op}\``}.`);
  if (points.length === 0) return [`Doesn't do anything yet: there are no ${adaptorInfo[job.adaptor].name} operations in its code.`];
  return points;
}
