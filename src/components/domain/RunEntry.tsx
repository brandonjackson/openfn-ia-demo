import { Search, RotateCcw, Ban } from "lucide-react";
import type { RunDetails, RunStep } from "../../model/workflow";
import Card from "../primitives/Card";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import IconButton from "../primitives/IconButton";
import StatusPill from "./StatusPill";

interface Props {
  run: RunDetails;
  /** The workflow's latest version; a run on an older one gets a yellow tag. */
  latestVersion?: string;
  /** Opens the run in the editor. */
  onInspect?: (run: RunDetails) => void;
  /** Runs the work order again from this step, with the input the step had. Left out where you can't run the workflow. */
  onRetryFromStep?: (run: RunDetails, step: RunStep) => void;
  /** Stops a run still waiting for a worker. */
  onCancel?: (run: RunDetails) => void;
}

/**
 * One run of a work order in History: its status, when and how it started,
 * the version it ran on, and each step it took, which you can retry from.
 */
export default function RunEntry({ run, latestVersion, onInspect, onRetryFromStep, onCancel }: Props) {
  const finished = run.status !== "pending" && run.status !== "running";
  const older = latestVersion !== undefined && run.version !== latestVersion;
  const how = [run.when, run.duration, `started by ${run.startedBy}`].filter(Boolean).join(" · ");

  return (
    <Card>
      <Stack gap="sm">
        <Inline justify="between" wrap>
          <Inline wrap>
            <StatusPill status={run.status} />
            <Text tone="strong" mono size="xs">
              Run {run.runId}
            </Text>
            <Badge label={run.version} tone={older ? "yellow" : "gray"} />
            <Text tone="muted" size="xs">
              {how}
            </Text>
          </Inline>
          <Inline gap="xs">
            {run.status === "pending" && onCancel && (
              <Button size="xs" variant="secondary" icon={Ban} onClick={() => onCancel(run)}>
                Cancel
              </Button>
            )}
            {onInspect && (
              <Button size="xs" variant="secondary" icon={Search} onClick={() => onInspect(run)}>
                Inspect
              </Button>
            )}
          </Inline>
        </Inline>

        {run.steps.length === 0 ? (
          <Text tone="muted" size="xs">
            {run.status === "cancelled" ? "Cancelled before it started." : "Waiting for a worker to pick it up."}
          </Text>
        ) : (
          <Stack gap="xs" label={`Steps of run ${run.runId}`}>
            {run.steps.map((step) => (
              <Inline key={step.id} justify="between">
                <Inline grow>
                  <StatusPill status={step.status} variant="icon" />
                  <Text>{step.label}</Text>
                  <Text tone="subtle" size="xs">
                    {step.duration}
                  </Text>
                  {step.error && (
                    <Text tone="danger" size="xs" truncate>
                      {step.error}
                    </Text>
                  )}
                </Inline>
                {finished && onRetryFromStep && (
                  <IconButton
                    size="xs"
                    icon={RotateCcw}
                    label={`Retry from ${step.label}`}
                    hint="Retry from here"
                    onClick={() => onRetryFromStep(run, step)}
                  />
                )}
              </Inline>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
