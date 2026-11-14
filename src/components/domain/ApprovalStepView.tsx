import { useId } from "react";
import { Plus, X } from "lucide-react";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Card from "../primitives/Card";
import Code from "../primitives/Code";
import FormField from "../primitives/FormField";
import { RadioOption, Select, TextArea, TextInput } from "../primitives/FormControls";
import IconButton from "../primitives/IconButton";
import IconTile from "../primitives/IconTile";
import Inline from "../primitives/Inline";
import ScrollPane from "../primitives/ScrollPane";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import {
  approvalComments,
  approvalTimeoutActions,
  decisionExpression,
  stepToolTypes,
  type ApprovalComment,
  type ApprovalField,
  type ApprovalTool,
} from "../../model/step-tools";

/**
 * A Human in the loop step's settings, shown where a step's code would be:
 * who's asked (a role or a person), what they see (a question, a message and
 * values from the run), whether they can comment, and how long the run waits
 * before it carries on without them. It's a lightweight take on n8n's "Send
 * and wait for response", Zapier's Request approval and Power Automate's
 * approvals: one approver, Approve or Reject, a timeout.
 *
 * Changes go straight to `onChange`, the way code edits do, and are saved
 * with the workflow. Left out (on main), it only reads.
 */
export default function ApprovalStepView({
  tool,
  onChange,
}: {
  tool: ApprovalTool;
  /** The step's settings as changed. Left out, the view only reads. */
  onChange?: (tool: ApprovalTool) => void;
}) {
  const id = useId();
  const readOnly = !onChange;
  const change = (changes: Partial<ApprovalTool>) => onChange?.({ ...tool, ...changes });
  const changeField = (index: number, changes: Partial<ApprovalField>) =>
    change({ fields: tool.fields.map((f, i) => (i === index ? { ...f, ...changes } : f)) });
  const { label, description, icon } = stepToolTypes.approval;

  return (
    <ScrollPane width="narrow">
      <Stack gap="lg">
        <Inline gap="md" align="start">
          <IconTile icon={icon} tone="indigo" />
          <Stack gap="xs">
            <Text tone="strong" size="md">
              {label}
            </Text>
            <Text tone="muted">{description} While it waits, the run shows as Waiting in History, where it's answered.</Text>
          </Stack>
        </Inline>

        <Card title="Who's asked">
          <FormField label="Approver" htmlFor={`${id}-assignee`} hint="A role in the project, like District registrar, or a person." required>
            <TextInput
              id={`${id}-assignee`}
              value={tool.assignee}
              readOnly={readOnly}
              placeholder="District registrar"
              onChange={(e) => change({ assignee: e.target.value })}
            />
          </FormField>
        </Card>

        <Card title="What they see" description={<>Both can use the run's state: <Code>{"{{ applicant.name }}"}</Code>.</>}>
          <Stack gap="md">
            <FormField label="Question" htmlFor={`${id}-title`} required>
              <TextInput id={`${id}-title`} value={tool.title} readOnly={readOnly} onChange={(e) => change({ title: e.target.value })} />
            </FormField>
            <FormField label="Message" htmlFor={`${id}-message`} hint="What to check before answering." optional>
              <TextArea id={`${id}-message`} rows={3} value={tool.message} readOnly={readOnly} onChange={(e) => change({ message: e.target.value })} />
            </FormField>
            <FormField label="Values from the run" hint="Each is shown beside the message: a label, and where on state it's read from." optional>
              <Stack gap="sm">
                {tool.fields.map((field, i) => (
                  <Inline key={i} gap="sm" grow>
                    <TextInput
                      aria-label={`Label ${i + 1}`}
                      value={field.label}
                      readOnly={readOnly}
                      placeholder="Applicant"
                      onChange={(e) => changeField(i, { label: e.target.value })}
                    />
                    <TextInput
                      aria-label={`Path ${i + 1}`}
                      mono
                      value={field.path}
                      readOnly={readOnly}
                      placeholder="applicant.name"
                      onChange={(e) => changeField(i, { path: e.target.value })}
                    />
                    {!readOnly && <IconButton icon={X} label={`Remove ${field.label || `value ${i + 1}`}`} onClick={() => change({ fields: tool.fields.filter((_, j) => j !== i) })} />}
                  </Inline>
                ))}
                {!readOnly && (
                  <Inline>
                    <Button variant="secondary" size="sm" icon={Plus} onClick={() => change({ fields: [...tool.fields, { label: "", path: "" }] })}>
                      Add a value
                    </Button>
                  </Inline>
                )}
              </Stack>
            </FormField>
          </Stack>
        </Card>

        <Card title="Their answer" description="They approve or reject; the answer goes on state as approval, with who answered and any comment.">
          <FormField label="Comment" htmlFor={`${id}-comment`}>
            <Select
              id={`${id}-comment`}
              options={approvalComments.map((c) => ({ value: c.id, label: c.label }))}
              value={tool.comment}
              disabled={readOnly}
              onChange={(e) => change({ comment: e.target.value as ApprovalComment })}
            />
          </FormField>
        </Card>

        <Card title="If nobody answers">
          <Stack gap="md">
            <FormField label="Wait for" htmlFor={`${id}-amount`}>
              <Inline gap="sm">
                <TextInput
                  id={`${id}-amount`}
                  type="number"
                  min={1}
                  value={String(tool.timeout.amount)}
                  readOnly={readOnly}
                  onChange={(e) => change({ timeout: { ...tool.timeout, amount: Math.max(1, Number(e.target.value) || 1) } })}
                />
                <Select
                  aria-label="Unit"
                  options={[
                    { value: "hours", label: "hours" },
                    { value: "days", label: "days" },
                  ]}
                  value={tool.timeout.unit}
                  disabled={readOnly}
                  onChange={(e) => change({ timeout: { ...tool.timeout, unit: e.target.value as "hours" | "days" } })}
                />
              </Inline>
            </FormField>
            <Stack gap="sm" label="Then">
              {approvalTimeoutActions.map((a) => (
                <RadioOption
                  key={a.id}
                  name={`${id}-timeout`}
                  label={a.label}
                  hint={a.description}
                  checked={tool.onTimeout === a.id}
                  disabled={readOnly && tool.onTimeout !== a.id}
                  readOnly={readOnly}
                  onChange={() => change({ onTimeout: a.id })}
                />
              ))}
            </Stack>
          </Stack>
        </Card>

        <Callout title="Where the run goes next">
          An approved run follows the edge whose condition is <Code>{decisionExpression("approved")}</Code>, and a rejected one{" "}
          <Code>{decisionExpression("rejected")}</Code>. With neither, it follows the step's success edge.
        </Callout>
      </Stack>
    </ScrollPane>
  );
}
