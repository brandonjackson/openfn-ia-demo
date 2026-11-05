interface Props {
  code: string;
  /** Small label above the code, e.g. "Request" or "JSON". */
  label?: string;
  /** Dark for data and output; light for snippets that sit among form controls. */
  tone?: "dark" | "light";
}

/** A read-only block of code or JSON, e.g. a sample request on an API page. */
export default function CodeBlock({ code, label, tone = "dark" }: Props) {
  const light = tone === "light";
  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${light ? "bg-gray-50" : "bg-gray-900"}`}>
      {label && (
        <div
          className={`border-b px-4 py-2 text-xs font-medium ${
            light ? "border-gray-200 text-gray-500" : "border-gray-700 text-gray-400"
          }`}
        >
          {label}
        </div>
      )}
      <pre className={`overflow-x-auto px-4 py-3 text-xs leading-relaxed ${light ? "text-gray-800" : "text-gray-100"}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
