/**
 * Starter ideas for a new public service, on the demo's own route
 * (`/api/demo/build_ideas`; Lightning's API has no AI building).
 */
import { useQuery } from "@tanstack/react-query";
import type { BuildIdea } from "../model/build-ideas";
import { listAll, none } from "./client";
import { statusOf, type LoadStatus } from "./status";

const keys = { all: ["build_ideas"] as const };

/** The starter ideas the Create page offers. */
export function useBuildIdeas(): { status: LoadStatus; ideas: BuildIdea[] } {
  // The route sends each idea in the model's own shape, so there's nothing to map.
  const query = useQuery({ queryKey: keys.all, queryFn: () => listAll<BuildIdea>("/api/demo/build_ideas") });
  return { status: statusOf(query), ideas: query.data ?? none };
}
