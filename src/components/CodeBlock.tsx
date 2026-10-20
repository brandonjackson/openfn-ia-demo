interface Props {
  code: string;
  /** Small label above the code, e.g. "Request" or "JSON". */
  label?: string;
}

/** A read-only block of code or JSON, e.g. a sample request on an API page. */
export default function CodeBlock({ code, label }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-900">
      {label && (
        <div className="border-b border-gray-700 px-4 py-2 text-xs font-medium text-gray-400">{label}</div>
      )}
      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
