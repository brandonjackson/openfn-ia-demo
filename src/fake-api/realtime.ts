/**
 * The pretend server's socket: what Lightning sends over a connection that
 * stays open, rather than in answer to a request. A client joins a topic and
 * is sent each event broadcast on it, as on a Phoenix channel. The topics and
 * events are Lightning's own (lib/lightning_web/channels/):
 *
 * - `run:<run id>`: a run as it happens. `run:updated` ({ run }),
 *   `step:started` and `step:completed` ({ step }).
 * - `workflow:<workflow id>`: `history_updated` ({ work_order_id, action })
 *   when a work order is made or gets another run.
 *
 * openfn-3-poc's api/ doesn't describe the realtime surface yet
 * (api/misfits.md), so this follows today's Lightning until it does.
 */
type Listener = (event: string, payload: unknown) => void;

const topics = new Map<string, Set<Listener>>();

/** Joins a topic; answers how to leave it. */
export function joinTopic(topic: string, listener: Listener): () => void {
  const listeners = topics.get(topic) ?? new Set<Listener>();
  topics.set(topic, listeners);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) topics.delete(topic);
  };
}

/**
 * Sends an event to everyone on a topic. It arrives a moment later, as over a
 * connection: never in the middle of whatever the server was doing when it
 * sent it.
 */
export function broadcast(topic: string, event: string, payload: unknown) {
  queueMicrotask(() => {
    for (const listener of [...(topics.get(topic) ?? [])]) listener(event, payload);
  });
}
