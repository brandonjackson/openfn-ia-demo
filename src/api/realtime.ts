/**
 * What the server sends without being asked: the one way the app hears it.
 * `follow` joins a topic on the server's socket and calls back on each event
 * (topics and events as in `src/fake-api/realtime.ts`, which are today's
 * Lightning's). Where the source has no socket yet, which is a real
 * Lightning until its realtime surface is specified, it calls back every
 * couple of seconds instead, with the event `"poll"`, so a caller that asks
 * again on any event works on both. Only this file knows which it is.
 */
import { join } from "./source";

/** How often to ask again where there's no socket: the wait openfn-3-poc's api/ suggests for a run. */
const POLL_MS = 2000;

/** Calls `listener` on each event on `topic`, until the returned function is called. */
export function follow(topic: string, listener: (event: string, payload: unknown) => void): () => void {
  if (join) return join(topic, listener);
  const timer = setInterval(() => listener("poll", undefined), POLL_MS);
  return () => clearInterval(timer);
}
