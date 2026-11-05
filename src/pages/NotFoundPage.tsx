export interface NotFoundPageProps {
  /** The URL that has nothing to show. */
  path: string;
  /**
   * "page" when no page lives at the URL; "data" when the page exists but
   * the record it names (a project, a system) doesn't.
   */
  reason: "page" | "data";
}

/** What any URL with nothing to show renders. */
export default function NotFoundPage({ path, reason }: NotFoundPageProps) {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
      <p className="mt-2 text-gray-500">
        {reason === "page" ? "No IA node found for" : "No data found for"}{" "}
        <code className="bg-gray-100 px-2 py-0.5 rounded">{path}</code>
      </p>
    </div>
  );
}
