import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { canRetry } from "./client";

/**
 * TanStack Query for the app. A failed load is tried up to twice more, a
 * refusal (4xx) never. Answers stay fresh for a few seconds, so moving
 * between pages doesn't flash a loading state for data already on screen.
 * Tests pass `retry={false}`, so a failure they ask for is the one they see.
 */
export default function ApiProvider({ children, retry = true }: { children: ReactNode; retry?: boolean }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: (count, error) => retry && canRetry(error) && count < 2, staleTime: 5_000, refetchOnWindowFocus: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
