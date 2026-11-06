import { act, render } from "@testing-library/react";
import type { ComponentType } from "react";
import { MemoryRouter } from "react-router-dom";

type Fn = (...args: never[]) => unknown;
/** A page's `on*` props. */
type ActionKey<P> = {
  [K in keyof P]-?: K extends `on${string}` ? (NonNullable<P[K]> extends Fn ? K : never) : never;
}[keyof P];
type Args<F> = F extends (...args: infer A) => unknown ? A : never;
type Reply<F> = F extends (...args: never[]) => infer R ? Awaited<R> : never;

interface Call {
  args: unknown[];
  settled: boolean;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

/**
 * Draws a page the way its wrapper feeds it: props down, promises up
 * (docs/architecture.md, The seam). Each action named in `actions` returns a
 * promise that waits until the test answers it with `resolve` or `reject`,
 * oldest call first, so pending, success and failure are each a step to
 * check. An action left out reaches the page as `undefined`, which is how a
 * wrapper leaves out what the viewer can't do. `sendProps` re-renders with new
 * data, as the wrapper does once the server's lists have reloaded.
 */
export function renderPage<P extends object>(Page: ComponentType<P>, data: Omit<P, ActionKey<P>>, actions: ActionKey<P>[]) {
  const calls = new Map<ActionKey<P>, Call[]>(actions.map((name) => [name, []]));
  const handlers = Object.fromEntries(
    actions.map((name) => [
      name,
      (...args: unknown[]) => new Promise((resolve, reject) => calls.get(name)!.push({ args, settled: false, resolve, reject })),
    ]),
  );

  let current = data;
  const page = () => (
    <MemoryRouter>
      <Page {...({ ...current, ...handlers } as P)} />
    </MemoryRouter>
  );
  const { rerender } = render(page());

  /** Settles the oldest call still waiting, and lets the page finish reacting to it. */
  const settle = async (name: ActionKey<P>, how: (call: Call) => void) => {
    const call = calls.get(name)?.find((c) => !c.settled);
    if (!call) throw new Error(`${String(name)} has no call waiting for a reply`);
    call.settled = true;
    await act(async () => how(call));
  };

  return {
    /** The arguments of every call to `name`, answered or not. */
    calls: <K extends ActionKey<P>>(name: K) => (calls.get(name) ?? []).map((c) => c.args as Args<P[K]>),
    resolve: <K extends ActionKey<P>>(name: K, ...reply: Reply<P[K]> extends void ? [] : [Reply<P[K]>]) =>
      settle(name, (c) => c.resolve(reply[0])),
    reject: (name: ActionKey<P>, error: unknown) => settle(name, (c) => c.reject(error)),
    /** Re-renders with `next` merged over the data so far. */
    sendProps: (next: Partial<Omit<P, ActionKey<P>>>) => {
      current = { ...current, ...next };
      rerender(page());
    },
  };
}
