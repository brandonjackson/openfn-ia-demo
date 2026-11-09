import { GitCompare, GitMerge } from "lucide-react";
import type { WorkflowChange } from "../../model/workflow-changes";
import Popover from "../primitives/Popover";
import IconButton from "../primitives/IconButton";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";

interface Props {
  /** The sandbox the changes are in. */
  sandbox: string;
  /** Where going live merges them. */
  target?: string;
  /** What the sandbox's copy of the workflow does differently, from `workflowChanges`. */
  changes: WorkflowChange[];
  /** Opens the go-live confirmation. Left out where you can't go live; the button goes with it. */
  onGoLive?: () => void;
  /** Start open (useful for stories). */
  defaultOpen?: boolean;
}

const marks: Record<WorkflowChange["kind"], { sign: string; tone: "success" | "danger" | "muted" }> = {
  added: { sign: "+", tone: "success" },
  removed: { sign: "−", tone: "danger" },
  changed: { sign: "~", tone: "muted" },
};

/**
 * The changes icon beside a sandboxed workflow's name, with a count of what's
 * changed. Clicking it lists the changes, one line each (+ added, − removed,
 * ~ changed), with "Go live" at the foot to take them to main.
 */
export default function SandboxChangesMenu({ sandbox, target = "main", changes, onGoLive, defaultOpen = false }: Props) {
  const count = changes.length;
  const label = count === 0 ? "No changes" : `${count} ${count === 1 ? "change" : "changes"}`;

  return (
    <Popover
      ariaLabel={`Changes in ${sandbox}`}
      defaultOpen={defaultOpen}
      widthClass="w-80"
      trigger={({ open, toggle }) => (
        <IconButton icon={GitCompare} size="sm" label={label} count={count} active={open} aria-expanded={open} aria-haspopup="dialog" onClick={toggle} />
      )}
      footer={
        onGoLive && count > 0
          ? (close) => (
              <Button
                size="sm"
                variant="dark"
                icon={GitMerge}
                fullWidth
                onClick={() => {
                  close();
                  onGoLive();
                }}
              >
                Go live
              </Button>
            )
          : undefined
      }
    >
      <Stack gap="sm">
        <Stack gap="none">
          <Text tone="strong">{label}</Text>
          <Text tone="muted" size="xs">
            {count === 0
              ? `Edits you make in ${sandbox} show up here.`
              : `Going live merges them into ${target} as a new version.`}
          </Text>
        </Stack>
        {count > 0 && (
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
        )}
      </Stack>
    </Popover>
  );
}
