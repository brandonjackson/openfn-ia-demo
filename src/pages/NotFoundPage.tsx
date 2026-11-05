import { ToggleRight } from "lucide-react";
import EmptyState from "../components/primitives/EmptyState";
import Code from "../components/primitives/Code";

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
  if (reason === "flag") {
    return (
      <EmptyState
        icon={ToggleRight}
        title="This feature is turned off"
        description={`${path} belongs to ${feature ?? "a feature"}, which is off in this demo. Turn it on from the feature flags in the bottom-right corner.`}
      />
    );
  }
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
      <p className="mt-2 text-gray-500">
        {reason === "page" ? "No IA node found for" : "No data found for"}{" "}
        <Code>{path}</Code>
      </p>
    </div>
  );
}
