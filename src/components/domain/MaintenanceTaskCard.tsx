import { useEffect, useState } from "react";
import { Check, Play, RefreshCw } from "lucide-react";
import type { MaintenanceTask } from "../../model/admin";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  task: MaintenanceTask;
  /** Runs the task; resolves when it's finished. */
  onRun: () => Promise<void>;
  /** How long "Done" shows after a run before the button goes back to Run, in milliseconds. */
  doneFor?: number;
}

/**
 * One maintenance job a superuser can run by hand, such as refreshing the
 * adaptor registry: what it does, when it last ran and what that did, and a
 * Run button that says when it's working and when it's done.
 */
export default function MaintenanceTaskCard({ task, onRun, doneFor = 3000 }: Props) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  useEffect(() => {
    if (state !== "done") return;
    const timer = setTimeout(() => setState("idle"), doneFor);
    return () => clearTimeout(timer);
  }, [state, doneFor]);

  const run = async () => {
    setState("running");
    try {
      await onRun();
      setState("done");
    } catch {
      setState("idle");
    }
  };

  return (
    <Card>
      <Inline justify="between" align="start" gap="md">
        <Stack gap="xs">
          <Text tone="strong">{task.title}</Text>
          <Text tone="muted" block>
            {task.description}
          </Text>
          <Text tone={state === "done" ? "success" : "subtle"} size="xs">
            {task.lastRun ? `Last run ${task.lastRun.at}: ${task.lastRun.result}` : "Hasn't run yet"}
          </Text>
        </Stack>
        <Button
          variant={state === "done" ? "secondary" : "primary"}
          size="sm"
          icon={state === "running" ? RefreshCw : state === "done" ? Check : Play}
          disabled={state === "running"}
          aria-live="polite"
          onClick={run}
        >
          {state === "running" ? "Running…" : state === "done" ? "Done" : "Run"}
        </Button>
      </Inline>
    </Card>
  );
}
