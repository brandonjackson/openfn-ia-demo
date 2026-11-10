import { ChevronDown, FlaskConical, GitMerge, LayoutGrid, Plus } from "lucide-react";
import type { WorkflowChange } from "../../model/workflow-changes";
import Popover from "../primitives/Popover";
import NavItem from "../primitives/NavItem";
import Badge from "../primitives/Badge";
import CountBadge from "../primitives/CountBadge";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";

interface Props {
  /** Sandboxes of the project, "main" first. */
  sandboxes: string[];
  value: string;
  onChange?: (sandbox: string) => void;
  /** Whether main is live or paused; the chip reads that way on main. */
  live?: boolean;
  /**
   * In a sandbox, what its copy of the workflow does differently, from
   * `workflowChanges`. The chip counts them and its panel lists them.
   */
  changes?: WorkflowChange[];
  /** Where going live merges the changes. */
  target?: string;
  /** Opens the go-live confirmation. Left out where you can't go live; the button goes with it. */
  onGoLive?: () => void;
  onNewSandbox?: () => void;
  onViewAll?: () => void;
  defaultOpen?: boolean;
}

const marks: Record<WorkflowChange["kind"], { sign: string; tone: "success" | "danger" | "muted" }> = {
  added: { sign: "+", tone: "success" },
  removed: { sign: "−", tone: "danger" },
  changed: { sign: "~", tone: "muted" },
};

/** "No changes", "1 change", "3 changes". */
function changesLabel(count: number) {
  return count === 0 ? "No changes" : `${count} ${count === 1 ? "change" : "changes"}`;
}

/**
 * The chip after the workflow name that says where you are: on main it reads
 * "Live" (or "Paused") with a status dot; in a sandbox it shows the sandbox's
 * name in amber, truncating when the toolbar is tight, with a count of what's
 * changed. Clicking it opens a panel: in a sandbox, the changes first, one
 * line each (+ added, − removed, ~ changed), with "Go live" to take them to
 * main; then the project's sandboxes to switch between, with a way to start a
 * new one or see them all.
 */
export default function SandboxChip({
  sandboxes,
  value,
  onChange,
  live = true,
  changes = [],
  target = "main",
  onGoLive,
  onNewSandbox,
  onViewAll,
  defaultOpen = false,
}: Props) {
  const onMain = value === "main";
  const count = onMain ? 0 : changes.length;
  const label = changesLabel(count);

  const trigger = onMain
    ? `inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${
        live ? "bg-green-50 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`
    : "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full bg-amber-50 px-2.5 font-mono text-xs text-amber-800 hover:bg-amber-100";

  // Switching sandbox, starting one or seeing them all. In a sandbox it sits
  // under the changes, pinned at the foot so a long list of changes scrolls past it.
  const sandboxList = (close: () => void) => (
    <Stack gap="xs">
      <Text tone="muted" size="xs">
        Sandboxes
      </Text>
      <Stack gap="none">
        {sandboxes.map((s) => (
          <NavItem
            key={s}
            variant="tree"
            label={s}
            description={s === "main" ? "Read-only" : undefined}
            active={s === value}
            onClick={() => {
              close();
              if (s !== value) onChange?.(s);
            }}
            trailing={s === "main" ? <Badge label={live ? "Live" : "Paused"} shape="tag" /> : undefined}
          />
        ))}
      </Stack>
      {(onNewSandbox || onViewAll) && (
        <Stack gap="none">
          {onNewSandbox && (
            <NavItem
              variant="tree"
              label="New sandbox…"
              icon={Plus}
              onClick={() => {
                close();
                onNewSandbox();
              }}
            />
          )}
          {onViewAll && (
            <NavItem
              variant="tree"
              label="View all sandboxes"
              icon={LayoutGrid}
              onClick={() => {
                close();
                onViewAll();
              }}
            />
          )}
        </Stack>
      )}
    </Stack>
  );

  return (
    <Popover
      ariaLabel={onMain ? "Sandboxes" : `Sandbox ${value}`}
      defaultOpen={defaultOpen}
      widthClass="w-80"
      shrink
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={onMain ? `main, ${live ? "live" : "paused"}` : `Sandbox ${value}, ${label.toLowerCase()}`}
          title={onMain ? `main · ${live ? "live" : "paused"}` : `Sandbox ${value} · ${label.toLowerCase()}`}
          className={trigger}
        >
          {onMain ? (
            <span className={`h-1.5 w-1.5 flex-none rounded-full ${live ? "bg-green-500" : "bg-gray-400"}`} aria-hidden />
          ) : (
            <FlaskConical size={12} className="flex-none text-amber-600" />
          )}
          <span className="min-w-0 max-w-[12rem] truncate">{onMain ? (live ? "Live" : "Paused") : value}</span>
          {count > 0 && <CountBadge count={count} tone="amber" />}
          <ChevronDown size={12} className="flex-none opacity-60" />
        </button>
      )}
      footer={onMain ? undefined : sandboxList}
    >
      {(close) =>
        onMain ? (
          sandboxList(close)
        ) : (
          <Stack gap="sm">
            <Stack gap="none">
              <Text tone="strong">{label}</Text>
              <Text tone="muted" size="xs">
                {count === 0 ? `Edits you make in ${value} show up here.` : `Going live merges them into ${target} as a new version.`}
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
            {onGoLive && count > 0 && (
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
            )}
          </Stack>
        )
      }
    </Popover>
  );
}
