import { useCallback, useEffect, useRef, useState } from "react";
import { RequestError } from "./errors";

/** The lifecycle of one request: idle, pending, or failed. */
export interface ActionState {
  pending: boolean;
  /** The last failure, cleared on the next run or by `reset`. */
  error: RequestError | Error | null;
}

export interface Action<Args extends unknown[]> extends ActionState {
  /**
   * Runs the handler. Resolves `true` when it succeeded and `false` when it
   * threw, so callers can close a modal or navigate only on success. Never
   * rejects; the failure is in `error`.
   */
  run: (...args: Args) => Promise<boolean>;
  reset: () => void;
}

/**
 * Wraps a request handler with pending and error state (STANDARDS.md
 * pattern 1). Every button, form and confirm that talks to the server goes
 * through this, or through a primitive that does (`FormModal`,
 * `ConfirmModal`). A sync handler works too; it just never shows pending.
 *
 * Calls while a run is pending are ignored, which is the double-click
 * guard. State updates after unmount are dropped.
 */
export interface ActionOptions {
  /** Called when the handler throws, e.g. to toast the message. The error is also in `error`. */
  onError?: (error: Error) => void;
}

export function useAction<Args extends unknown[]>(handler: (...args: Args) => void | Promise<void>, options: ActionOptions = {}): Action<Args> {
  const [state, setState] = useState<ActionState>({ pending: false, error: null });
  const mounted = useRef(true);
  const running = useRef(false);
  const latest = useRef({ handler, options });
  latest.current = { handler, options };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (...args: Args) => {
    if (running.current) return false;
    running.current = true;
    setState({ pending: true, error: null });
    try {
      await latest.current.handler(...args);
      if (mounted.current) setState({ pending: false, error: null });
      return true;
    } catch (e) {
      const error = e instanceof Error ? e : new RequestError(String(e));
      if (mounted.current) setState({ pending: false, error });
      latest.current.options.onError?.(error);
      return false;
    } finally {
      running.current = false;
    }
  }, []);

  const reset = useCallback(() => setState({ pending: false, error: null }), []);

  return { ...state, run, reset };
}
