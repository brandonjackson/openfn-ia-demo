import { useId, useRef, useState } from "react";
import { cronFrequencies, cronProblem, describeCron, frequencyOf, withFrequency, type CronFrequency } from "../../model/cron";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Stack from "../primitives/Stack";

interface Props {
  /** The schedule as saved, five cron fields in UTC. */
  value: string;
  /** Called with each schedule that reads; one that doesn't stays here, said under the field, until it's fixed. */
  onChange?: (expression: string) => void;
  /** On main nothing can be changed. */
  readOnly?: boolean;
}

/**
 * A cron trigger's schedule, as Lightning's cron form has it: a frequency
 * (every hour, day, week, month, or custom) that fills in the expression,
 * and the expression itself, read back in words underneath. An expression
 * that doesn't read is kept in the field and said under it, and only one
 * that reads is passed on, so a half-typed schedule is never saved.
 */
export default function CronScheduleField({ value, onChange, readOnly = false }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [frequency, setFrequency] = useState<CronFrequency>(frequencyOf(value));
  const [touched, setTouched] = useState(false);
  const problem = cronProblem(draft);

  const take = (next: string) => {
    setDraft(next);
    if (!cronProblem(next)) onChange?.(next.trim().replace(/\s+/g, " "));
  };

  return (
    <Stack gap="md">
      <FormField label="Frequency" htmlFor={`${id}-frequency`}>
        <Select
          id={`${id}-frequency`}
          options={cronFrequencies.map((f) => ({ value: f.id, label: f.label }))}
          value={frequency}
          disabled={readOnly}
          onChange={(e) => {
            const next = e.target.value as CronFrequency;
            setFrequency(next);
            if (next === "custom") inputRef.current?.focus();
            else take(withFrequency(problem ? value : draft, next));
          }}
        />
      </FormField>
      <FormField
        label="Cron expression"
        htmlFor={`${id}-expression`}
        hint={problem ? "Minute, hour, day of month, month and day of week, in UTC." : `${describeCron(draft)} (UTC).`}
        error={touched ? problem : undefined}
      >
        <TextInput
          id={`${id}-expression`}
          ref={inputRef}
          mono
          value={draft}
          disabled={readOnly}
          aria-invalid={touched && !!problem}
          onChange={(e) => {
            const next = e.target.value;
            if (!cronProblem(next)) setFrequency(frequencyOf(next));
            take(next);
          }}
          onBlur={() => setTouched(true)}
        />
      </FormField>
    </Stack>
  );
}
