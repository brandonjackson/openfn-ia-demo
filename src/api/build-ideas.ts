/**
 * Starter ideas for a new public service, on the demo's own route
 * (`/api/demo/build_ideas`; Lightning's API has no AI building).
 */
import { useQuery } from "@tanstack/react-query";
import type { BuildIdea } from "../model/build-ideas";
import { listAll } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** An idea as GET /api/demo/build_ideas lists it. */
interface ApiBuildIdea {
  id: string;
  title: string;
  description: string;
  systems: string[];
  prompt: string;
}

const keys = { all: ["build_ideas"] as const };

/** The starter ideas the Create page offers. */
export function useBuildIdeas(): { status: LoadStatus; ideas: BuildIdea[] } {
  const query = useQuery({
    queryKey: keys.all,
    queryFn: () => listAll<ApiBuildIdea>("/api/demo/build_ideas"),
    select: (rows): BuildIdea[] => rows.map(({ id, title, description, systems, prompt }) => ({ id, title, description, systems, prompt })),
  });
  return { status: statusOf(query), ideas: query.data ?? [] };
}
