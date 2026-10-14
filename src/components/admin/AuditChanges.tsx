import type { AuditEvent } from "../../mock-data/admin";
import { Td } from "../Table";

/**
 * The change strip under each audit row (AuditLive.Index `diff`): every
 * changed field as `field old → new` (old struck through), then any
 * encrypted credential bodies, or "No changes". Renders a full-width <td>.
 */
export default function AuditChanges({ audit }: { audit: AuditEvent }) {
  const before = audit.changes.before ?? {};
  const after = audit.changes.after ?? {};
  const changes = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .sort()
    .map((key) => ({ key, old: before[key] ?? null, next: after[key] ?? null }));
  const bodies = Object.entries(audit.credentialBodies ?? {})
    .map(([key, value]) => [key.replace(/^body:/, ""), value] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  if (changes.length === 0 && bodies.length === 0) {
    return (
      <Td colSpan={4} className="p-6! font-mono text-xs break-all">
        No changes
      </Td>
    );
  }

  return (
    <Td colSpan={4} className="p-4! font-mono text-xs break-all">
      {changes.length > 0 && (
        <ul className="p-2 bg-gray-50 rounded-md ring ring-gray-100 mb-3">
          {changes.map(({ key, old, next }) => (
            <li key={key} className="mb-2 last:mb-0">
              <span className="font-semibold">{key}</span>&nbsp;{" "}
              {old !== null && (
                <>
                  <span className="text-gray-500 line-through">{old}</span>
                  <span className="hero-arrow-right h-4 w-4 inline-block mx-2 text-gray-400" />
                </>
              )}
              <span className="text-gray-900">{next ?? ""}</span>
            </li>
          ))}
        </ul>
      )}
      {bodies.length > 0 && (
        <ul className="p-2 bg-gray-50 rounded-md ring ring-gray-100">
          {bodies.map(([env, body]) => (
            <li key={env} className="mb-2 last:mb-0">
              <span className="font-semibold">body:{env}</span>&nbsp;{" "}
              <span className="text-gray-700 break-all">{body}</span>
            </li>
          ))}
        </ul>
      )}
    </Td>
  );
}
