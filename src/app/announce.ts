import { createContext, useContext, useMemo } from "react";
import type { ToastTone } from "../components/primitives/Toast";
import { FormError, errorMessageOf } from "../model/form-error";

/** Something an action just did, said once in a toast. */
export interface Announcement {
  /** `success` goes by itself; `error` stays until it's closed; `info` is a note. */
  tone: ToastTone;
  /** What happened, as a sentence: "Deleted dedup." */
  message: string;
  /** More about it, e.g. why the server refused. */
  detail?: string;
}

export type Announce = (announcement: Announcement) => void;

/** Where `useAnnounce` sends a toast; `AnnouncementsProvider` fills it. Without one, nothing is said. */
export const AnnounceContext = createContext<Announce>(() => {});

/**
 * Says what an action just did, in a toast: `announce({ tone: "success",
 * message: "Created a sandbox from main." })`. For the outcome of an action
 * only: a form's problems stay under their fields.
 */
export function useAnnounce(): Announce {
  return useContext(AnnounceContext);
}

/** What to say when an action works, and when it's refused (the server's reason goes under it). */
export interface Outcome {
  /** A sentence, or one with more under it ("Open a work order to follow its runs."). */
  success?: string | { message: string; detail?: string };
  failure?: string;
}

/**
 * Announces how an action went and hands its promise back, so the page can
 * still show it pending. A refusal is announced as an error with the server's
 * reason, then rejected again: a form leaves `failure` out and shows it under
 * its fields instead.
 */
export function useAnnounceOutcome() {
  const announce = useAnnounce();
  return useMemo(
    () =>
      async <T,>(action: Promise<T>, outcome: Outcome): Promise<T> => {
        try {
          const result = await action;
          const success = typeof outcome.success === "string" ? { message: outcome.success } : outcome.success;
          if (success) announce({ tone: "success", ...success });
          return result;
        } catch (error) {
          if (outcome.failure) announce({ tone: "error", message: outcome.failure, detail: reasonOf(error) });
          throw error;
        }
      },
    [announce],
  );
}

/** Why the server refused, as a sentence: the first field it names ("Name is already in the handbook."), else its message. */
function reasonOf(error: unknown): string {
  if (error instanceof FormError) {
    const [field, problems] = Object.entries(error.fieldErrors)[0] ?? [];
    if (field && problems?.[0]) {
      const words = field.replace(/[._]/g, " ");
      return `${words.charAt(0).toUpperCase()}${words.slice(1)} ${problems[0].replace(/\.$/, "")}.`;
    }
  }
  return errorMessageOf(error);
}
