import { useLocation } from "react-router-dom";
import { projects } from "../mock-data/projects";
import type { Project } from "../mock-data/projects";

/** The project the current URL is inside, if any. */
export function useCurrentProject(): Project | undefined {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? projects.find((p) => p.id === match[1]) : undefined;
}
