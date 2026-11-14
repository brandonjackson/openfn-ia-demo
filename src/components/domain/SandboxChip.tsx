import { ArrowRight, Check, ChevronDown, FlaskConical, LayoutGrid, Lock, Plus } from "lucide-react";
import { changesLabel, type WorkflowChange } from "../../model/workflow-changes";
import Popover from "../primitives/Popover";
import NavItem from "../primitives/NavItem";
import CountBadge from "../primitives/CountBadge";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import SandboxChangeList from "./SandboxChangeList";

interface Props {
  /** Sandboxes of the project, "main" first. */
  sandboxes: string[];
  value: string;
  onChange?: (sandbox: string) => void;
  /**
   * In a sandbox, what its copy of the workflow does differently, from
   * `workflowChanges`. The chip counts them and its panel lists them.
   */
  changes?: WorkflowChange[];
  /** Where promoting merges the changes. */
  target?: string;
  /** Opens the promotion request. Left out where you can't promote; the button goes with it. */
  onPromote?: () => void;
  onNewSandbox?: () => void;
  onViewAll?: () => void;
  defaultOpen?: boolean;
}

/**
 * The chip after the workflow name that says where you are: on main, "main"
 * with a lock, since main is read-only; in a sandbox, its name in amber with a
 * flask, truncating when the toolbar is tight, and a count of what's changed.
 * Clicking it opens a panel: in a sandbox, the changes first, one line each
 * (+ added, − removed, ~ changed), with "Create promotion request" to take
 * them to main; then the project's sandboxes to switch to, with a way to start
 * a new one or see them all.
 */
export default function SandboxChip({
  sandboxes,
  value,
  onChange,
  changes = [],
  target = "main",
  onPromote,
  onNewSandbox,
  onViewAll,
  defaultOpen = false,
}: Props) {
  const onMain = value === "main";
  const count = onMain ? 0 : changes.length;
  const label = changesLabel(count);

  // Switching sandbox, starting one or seeing them all. In a sandbox it sits
  // under the changes, pinned at the foot so a long list of changes scrolls past it.
  const sandboxList = (close: () => void) => (
    <Stack gap="xs">
      <Text tone="muted" size="xs">
        Switch to
      </Text>
      <Stack gap="none">
        {sandboxes.map((s) => (
          <NavItem
            key={s}
            variant="tree"
            label={s}
            icon={s === "main" ? Lock : FlaskConical}
            active={s === value}
            onClick={() => {
              close();
              if (s !== value) onChange?.(s);
            }}
            trailing={
              s === value ? (
                <Check size={14} aria-label="Current" />
              ) : s === "main" ? (
                <Text tone="muted" size="xs">
                  Read-only
                </Text>
              ) : undefined
            }
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
        <Button
          variant={onMain ? "secondary" : "caution"}
          size="sm"
          icon={onMain ? Lock : FlaskConical}
          shrink
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={onMain ? "main, read-only" : `Sandbox ${value}, ${label.toLowerCase()}`}
          title={onMain ? "main · read-only" : `Sandbox ${value} · ${label.toLowerCase()}`}
        >
          <Text tone="inherit" mono truncate>
            {value}
          </Text>
          {count > 0 && <CountBadge count={count} tone="amber" />}
          <ChevronDown size={14} />
        </Button>
      )}
      footer={onMain ? undefined : sandboxList}
    >
      {(close) =>
        onMain ? (
          sandboxList(close)
        ) : (
          <Stack gap="sm">
            <Stack gap="none">
              <Text tone="muted" size="xs">
                {label} from {target}
              </Text>
              {count === 0 && (
                <Text tone="muted" size="xs">
                  Edits you make in {value} show up here.
                </Text>
              )}
            </Stack>
            {count > 0 && <SandboxChangeList changes={changes} />}
            {onPromote && count > 0 && (
              <Button
                size="sm"
                variant="dark"
                icon={ArrowRight}
                fullWidth
                onClick={() => {
                  close();
                  onPromote();
                }}
              >
                Create promotion request
              </Button>
            )}
          </Stack>
        )
      }
    </Popover>
  );
}
