import { FileQuestion, SearchX, ToggleRight, type LucideIcon } from "lucide-react";
import EmptyState from "../../components/primitives/EmptyState";

export interface NotFoundPageProps {
  /** The URL that has nothing to show. */
  path: string;
  /**
   * "page" when no page lives at the URL; "data" when the page exists but
   * the record it names (a project, a system) doesn't; "flag" when the page
   * belongs to a feature that's turned off.
   */
  reason: "page" | "data" | "flag";
  /** With reason "flag", the feature's name, e.g. "Connected systems". */
  feature?: string;
}

/** What any URL with nothing to show renders. */
export default function NotFoundPage({ path, reason, feature }: NotFoundPageProps) {
  const says: Record<NotFoundPageProps["reason"], { icon: LucideIcon; title: string; description: string }> = {
    page: { icon: FileQuestion, title: "Page not found", description: `There's no page at ${path}.` },
    data: {
      icon: SearchX,
      title: "Page not found",
      description: `What ${path} points to isn't there. It may have been deleted, or you may not have access to it.`,
    },
    flag: {
      icon: ToggleRight,
      title: "This feature is turned off",
      description: `${path} belongs to ${feature ?? "a feature"}, which is off in this demo. Turn it on from the feature flags in the bottom-right corner.`,
    },
  };
  return <EmptyState {...says[reason]} />;
}
