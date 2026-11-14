import { useId } from "react";
import Card from "../primitives/Card";
import Code from "../primitives/Code";
import FormField from "../primitives/FormField";
import { RadioOption, TextArea } from "../primitives/FormControls";
import IconTile from "../primitives/IconTile";
import Inline from "../primitives/Inline";
import ScrollPane from "../primitives/ScrollPane";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import OutcomeBadge from "./OutcomeBadge";
import { outcomeStatuses, stepToolTypes, type OutcomeTool } from "../../model/step-tools";

/**
 * A Report outcome step's settings, shown where a step's code would be: the
 * outcome it records for the run (Success, Rejected, Needs follow-up…) and a
 * line saying what happened, which can use the run's state. It's what
 * History lists a work order by, beside the run's own status.
 *
 * Changes go straight to `onChange`, the way code edits do, and are saved
 * with the workflow. Left out (on main), it only reads.
 */
export default function ReportOutcomeView({
  tool,
  onChange,
}: {
  tool: OutcomeTool;
  /** The step's settings as changed. Left out, the view only reads. */
  onChange?: (tool: OutcomeTool) => void;
}) {
  const id = useId();
  const readOnly = !onChange;
  const { label, description, icon } = stepToolTypes.outcome;
  return (
    <ScrollPane width="narrow">
      <Stack gap="lg">
        <Inline gap="md" align="start">
          <IconTile icon={icon} tone="indigo" />
          <Stack gap="xs">
            <Text tone="strong" size="md">
              {label}
            </Text>
            <Text tone="muted">
              {description} A run that went without a hitch can still have refused the application, so the outcome is set here rather than read
              from the run.
            </Text>
          </Stack>
        </Inline>

        <Card title="Outcome" description="What History shows for the work order when a run ends here." actions={<OutcomeBadge status={tool.status} />}>
          <Stack gap="sm" label="Outcome">
            {outcomeStatuses.map((o) => (
              <RadioOption
                key={o.id}
                name={`${id}-status`}
                label={o.label}
                hint={o.description}
                checked={tool.status === o.id}
                disabled={readOnly && tool.status !== o.id}
                readOnly={readOnly}
                onChange={() => onChange?.({ ...tool, status: o.id })}
              />
            ))}
          </Stack>
        </Card>

        <Card title="Description">
          <FormField
            label="What happened"
            htmlFor={`${id}-description`}
            hint={
              <>
                One line for History. <Code>{"{{ path }}"}</Code> fills in a value from the run's state, e.g. <Code>{"{{ application.given_name }}"}</Code>.
              </>
            }
          >
            <TextArea
              id={`${id}-description`}
              rows={3}
              value={tool.description}
              readOnly={readOnly}
              placeholder="National ID {{ nationalId }} issued"
              onChange={(e) => onChange?.({ ...tool, description: e.target.value })}
            />
          </FormField>
        </Card>
      </Stack>
    </ScrollPane>
  );
}
