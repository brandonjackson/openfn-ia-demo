import { ChevronDown } from "lucide-react";
import Popover from "../primitives/Popover";
import Button from "../primitives/Button";
import ToggleSwitch from "../primitives/ToggleSwitch";
import StatusDot from "../primitives/StatusDot";
import Badge from "../primitives/Badge";
import type { BadgeTone } from "../primitives/Badge";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";

interface Props {
  /** Where you're working: "main" or a sandbox's name. */
  sandbox: string;
  /** Whether the workflow's trigger is on here, so it starts runs by itself. */
  live: boolean;
  /** Turns the trigger on or off. Left out where you can't; the switch is greyed out. */
  onToggle?: (live: boolean) => void;
  /** The environment credentials (and environment variables) load their values from here, e.g. "production". Left out while it isn't known. */
  environment?: string;
  /** Lists environment variables among what runs use, where the project has them. */
  showEnvVars?: boolean;
  /** Start open (useful for stories). */
  defaultOpen?: boolean;
}

interface Use {
  label: string;
  value: string;
  tone: BadgeTone;
}

/**
 * "Live" or "Paused", just left of Run: whether the workflow's trigger starts
 * runs where you are. It opens a panel with the switch that turns the
 * trigger on or off, then what a run here uses: which values credentials and
 * environment variables load, where its run history goes, and whose
 * collections it reads and writes. A sandbox is a copy of its project, so in
 * one, runs use its own environment variables, run history and collections,
 * and its environment's credential values; what differs from main is tinted.
 */
export default function TriggerStatusMenu({ sandbox, live, onToggle, environment, showEnvVars = false, defaultOpen = false }: Props) {
  const onMain = sandbox === "main";
  const state = live ? "Live" : "Paused";
  const here = onMain ? "on main" : "in this sandbox";
  const envTone: BadgeTone = onMain ? "gray" : "yellow";
  const values = environment ? `${environment} values` : "Not set";

  const uses: Use[] = [
    { label: "Credentials", value: values, tone: envTone },
    // A sandbox has its own environment variables, so its runs use its values, e.g. its staging ones.
    ...(showEnvVars ? [{ label: "Environment variables", value: onMain || !environment ? values : `Sandbox's ${values}`, tone: envTone }] : []),
    ...(onMain ? [] : [{ label: "Run history", value: "This sandbox only", tone: "yellow" as const }]),
    onMain
      ? { label: "Collections", value: "The project's own", tone: "gray" }
      : { label: "Collections", value: "This sandbox only", tone: "yellow" },
  ];

  return (
    <Popover
      ariaLabel="Triggers"
      align="right"
      widthClass="w-96"
      defaultOpen={defaultOpen}
      footerInset="even"
      trigger={({ open, toggle }) => (
        <Button
          variant="ghost"
          size="sm"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Triggers: ${state.toLowerCase()}`}
          onClick={toggle}
        >
          <StatusDot tone={live ? "green" : "gray"} />
          {state}
          <ChevronDown size={14} />
        </Button>
      )}
      footer={
        <Stack gap="sm">
          <Text tone="muted" size="xs">
            Runs {here} use
          </Text>
          {uses.map((u) => (
            <Inline key={u.label} justify="between" gap="md">
              <Text nowrap>{u.label}</Text>
              <Badge label={u.value} tone={u.tone} shape="tag" />
            </Inline>
          ))}
        </Stack>
      }
    >
      <Stack gap="xs">
        <Inline justify="between" gap="md">
          <Inline gap="sm">
            <StatusDot tone={live ? "green" : "gray"} />
            <Text tone="strong">{state}</Text>
          </Inline>
          <ToggleSwitch
            checked={live}
            onChange={onToggle}
            disabled={!onToggle}
            label={live ? "Turn triggers off" : "Turn triggers on"}
            hideLabel
          />
        </Inline>
        <Text tone="muted" size="xs" block>
          {live ? `Triggers start runs ${here}.` : `Triggers are off ${here}. Runs start only when you press Run.`}
        </Text>
      </Stack>
    </Popover>
  );
}
