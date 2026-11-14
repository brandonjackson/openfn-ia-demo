import { useId, useState } from "react";
import { Check, X } from "lucide-react";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import FormField from "../primitives/FormField";
import { TextArea } from "../primitives/FormControls";
import Inline from "../primitives/Inline";
import PropertyList from "../primitives/PropertyList";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import StatusPill from "./StatusPill";
import { focusFirstProblem } from "../primitives/focus-field";
import { firstProblemOf } from "../../model/form-error";
import { approvalTimeoutActions, type ApprovalDecision, type ApprovalRequest } from "../../model/step-tools";

/**
 * A run waiting on a Human in the loop step: the question, the message and
 * the run's values its step chose to show, who's asked, and what happens if
 * nobody answers in time. With `onAnswer`, Approve and Reject answer it
 * (with a comment, required to reject when the step says so) and the run
 * carries on; without, it only says what it's waiting for.
 */
export default function ApprovalRequestCard({
  request,
  onAnswer,
}: {
  request: ApprovalRequest;
  /** Answers it; resolves once the run has carried on, rejects with why it was refused. Left out, nobody here can answer. */
  onAnswer?: (decision: ApprovalDecision, comment: string) => Promise<void>;
}) {
  const id = useId();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<ApprovalDecision | null>(null);
  const [missing, setMissing] = useState(false);
  const [refused, setRefused] = useState<unknown>(null);
  const timeout = approvalTimeoutActions.find((a) => a.id === request.onTimeout);

  const answer = async (decision: ApprovalDecision) => {
    if (!onAnswer || busy) return;
    const needsComment = decision === "rejected" && request.comment === "required_on_reject" && !comment.trim();
    setMissing(needsComment);
    if (focusFirstProblem([[`${id}-comment`, needsComment]])) return;
    setBusy(decision);
    setRefused(null);
    try {
      await onAnswer(decision, comment.trim());
    } catch (error) {
      setRefused(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card
      title={request.title}
      description={`Asked of ${request.assignee} ${request.asked}`}
      actions={<StatusPill status="waiting" />}
    >
      <Stack gap="md">
        {request.message && <Text>{request.message}</Text>}
        {request.fields.length > 0 && <PropertyList variant="plain" properties={request.fields.map((f) => ({ label: f.label, value: f.value }))} />}
        <Text tone="muted" size="xs">
          Times out {request.expires}; then it'll {timeout ? timeout.label.toLowerCase() : "stop"}.
        </Text>
        {onAnswer ? (
          <>
            {request.comment !== "none" && (
              <FormField
                label="Comment"
                htmlFor={`${id}-comment`}
                required={request.comment === "required_on_reject"}
                optional={request.comment === "optional"}
                hint={request.comment === "required_on_reject" ? "Needed to reject." : undefined}
                error={missing ? "Say why it's rejected" : undefined}
              >
                <TextArea
                  id={`${id}-comment`}
                  rows={2}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (e.target.value.trim()) setMissing(false);
                  }}
                />
              </FormField>
            )}
            <Inline gap="sm">
              <Button icon={Check} aria-disabled={busy !== null} onClick={() => void answer("approved")}>
                {busy === "approved" ? "Approving…" : "Approve"}
              </Button>
              <Button variant="secondary" icon={X} aria-disabled={busy !== null} onClick={() => void answer("rejected")}>
                {busy === "rejected" ? "Rejecting…" : "Reject"}
              </Button>
            </Inline>
            {refused !== null && (
              <Text tone="danger" role="alert">
                {firstProblemOf(refused)}
              </Text>
            )}
          </>
        ) : (
          <Text tone="muted">Waiting for {request.assignee} to answer.</Text>
        )}
      </Stack>
    </Card>
  );
}
