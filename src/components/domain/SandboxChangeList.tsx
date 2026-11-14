import type { WorkflowChange } from "../../model/workflow-changes";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";

const marks: Record<WorkflowChange["kind"], { sign: string; tone: "success" | "danger" | "muted" }> = {
  added: { sign: "+", tone: "success" },
  removed: { sign: "−", tone: "danger" },
  changed: { sign: "~", tone: "muted" },
};

interface Props {
  /** What a sandbox changes, from `workflowChanges`, `componentChanges` or `previewChanges`. */
  changes: WorkflowChange[];
}

/**
 * What a sandbox changes, one line each: + added, − removed, ~ changed. The
 * sandbox chip's panel lists them, and so does the promotion request that
 * takes them to the sandbox's parent.
 */
export default function SandboxChangeList({ changes }: Props) {
  return (
    <Stack gap="xs">
      {changes.map((c, i) => (
        <Inline key={i} gap="sm" align="start">
          <Text mono tone={marks[c.kind].tone}>
            {marks[c.kind].sign}
          </Text>
          <Text>{c.summary}</Text>
        </Inline>
      ))}
    </Stack>
  );
}
