/*
 * Starter ideas for a new public service, on the demo's own routes: api/
 * has no AI building (docs/api-gaps.md). Anyone signed in reads them; the
 * demo has no way to add one.
 *
 *   GET /api/demo/build_ideas    the ideas, paged
 */
import { buildIdeas } from "../fixtures/build-ideas";
import { seedId } from "../fixtures/ids";
import { json, paged, type Handler } from "./answers";
import { table } from "./db";

interface IdeaRow {
  id: string;
  title: string;
  description: string;
  /** The names of the systems it connects. */
  systems: string[];
  /** What it puts in the prompt box. */
  prompt: string;
}

const ideas = table<IdeaRow>("build_ideas", () =>
  buildIdeas.map((i) => ({ id: seedId("build_idea", i.id), title: i.title, description: i.description, systems: i.systems, prompt: i.prompt })),
);

export const buildIdeaRoutes: Record<string, Handler> = {
  "GET /api/demo/build_ideas": (_params, _body, query) => json(200, paged("/api/demo/build_ideas", ideas.rows(), query)),
};
