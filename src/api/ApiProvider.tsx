import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { canRetry } from "./client";
import { isMergePreview } from "./workflows";

/**
 * TanStack Query for the app. A failed load is tried up to twice more, a
 * refusal (4xx) never. Answers stay fresh for a few seconds, so moving
 * between pages doesn't flash a loading state for data already on screen.
 * Tests pass `retry={false}`, so a failure they ask for is the one they see.
 *
 * Whatever a save changes, a sandbox's merge preview may now say something
 * else (a doc edited, a test added, a component renamed), so every save asks
 * for the previews on screen again. That keeps every count of a sandbox's
 * changes (the sandbox chip, the Sandboxes page, the editor) in step without
 * each resource's hooks having to know about sandboxes.
 */
export default function ApiProvider({ children, retry = true }: { children: ReactNode; retry?: boolean }) {
  const [client] = useState(
    () => {
      const client: QueryClient = new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: () => void client.invalidateQueries({ predicate: (q) => isMergePreview(q.queryKey) }),
        }),
        defaultOptions: {
          queries: { retry: (count, error) => retry && canRetry(error) && count < 2, staleTime: 5_000, refetchOnWindowFocus: false },
        },
      });
      return client;
    },
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
