/** The demo's own controls over its fake server: not part of Lightning's API. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

/** Puts every record back to the fixtures, forgetting what was made, changed or deleted, and reloads what's on screen. */
export function useResetDemoData() {
  const queryClient = useQueryClient();
  const reset = useMutation({
    mutationFn: () => request<void>("POST", "/api/demo/reset"),
    onSuccess: () => queryClient.resetQueries(),
  });
  return { reset: () => reset.mutateAsync(), resetting: reset.isPending };
}
