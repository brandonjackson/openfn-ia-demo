/**
 * Stands in for the network until pages are wired. Every mutation in a page
 * awaits `simulateRequest`, so the pending and error states of the
 * primitives are exercised in the demo. Once wired, the real client replaces
 * this and the pages' `await` lines stay as they are.
 */
import { RequestError } from "../utils/errors";

/** Delay to make pending states visible, in ms. */
const LATENCY_MS = 600;

const settings = {
  /** Reject the next call with this message, then clear. For stories and manual testing. */
  failNextWith: null as string | null,
};

/** Makes the next `simulateRequest` fail, e.g. from a story's play function or the console. */
export function failNextRequest(message = "The server could not complete that request.") {
  settings.failNextWith = message;
}

/** Resolves with `result` after a short delay, or rejects once if `failNextRequest` was called. */
export function simulateRequest<T = void>(result?: T, options: { latencyMs?: number; fieldErrors?: Record<string, string[]> } = {}): Promise<T> {
  const fail = settings.failNextWith;
  settings.failNextWith = null;
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (fail) reject(new RequestError(fail, { fieldErrors: options.fieldErrors }));
      else resolve(result as T);
    }, options.latencyMs ?? LATENCY_MS);
  });
}
