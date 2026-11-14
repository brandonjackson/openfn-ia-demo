import { useRef, useState } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
import type { Environment } from "../../model/credentials";
import { ENVIRONMENTS, environmentLabels } from "../../model/credentials";
import { DEFAULT_SANDBOX_ENV, sandboxEnvironment, sandboxNameError, sandboxSlug, type SandboxDraft } from "../../model/sandboxes";
import { firstProblemOf, fieldErrorOf } from "../../model/form-error";
import { describeJsonProblem } from "./json-input";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import Code from "../primitives/Code";
import Checkbox from "../primitives/Checkbox";
import Callout from "../primitives/Callout";
import FormField from "../primitives/FormField";
import { Select, TextArea, TextInput } from "../primitives/FormControls";

/** A loaded run whose input a new sandbox can start with. */
export interface SandboxFormRun {
  runId: string;
  /** The workflow version it ran on, e.g. "v2". */
  version?: string;
  /** What it received; left out when the project doesn't keep inputs. */
  input?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** The heading, e.g. "Edit in sandbox"; by default "New sandbox", or "Edit" and the sandbox's name. */
  title?: string;
  /** The sandbox being edited; without it, a new one is being made. */
  sandbox?: { name: string; env: string };
  /** Every sandbox in the project, "main" first: the ones a new one can be made from, and the names taken. */
  sandboxes: string[];
  /** The sandbox a new one is made from unless another is picked, usually the one you're in. */
  defaultParent?: string;
  /**
   * The run loaded in the editor, when there is one: a new sandbox can start
   * with a copy of its input, which you check before it leaves.
   */
  run?: SandboxFormRun;
  /** The version live now, which a new sandbox starts from, to say so when the run used an older one. */
  latestVersion?: string;
  /** Makes or saves the sandbox. Resolves once it's done; a refusal shows under the field it's about, and the form stays open. */
  onSubmit: (draft: SandboxDraft) => Promise<void>;
}

/**
 * Making a sandbox, or editing one, wherever it happens: New sandbox on the
 * Sandboxes page and in the sandbox chip, Edit on the Sandboxes page, and
 * "Edit in sandbox" in the editor. It asks for a name (shown as the slug it
 * becomes), the environment its runs use, and for a new one the sandbox to
 * copy. With a run loaded, a new one can start with a copy of the run's
 * input, checked first so nothing leaves that shouldn't. The project's saved
 * dataclips come along anyway.
 */
export default function SandboxFormModal({ open, ...rest }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <SandboxForm key={rest.sandbox?.name ?? "new"} {...rest} />;
}

function SandboxForm({ onClose, title, sandbox, sandboxes, defaultParent = "main", run, latestVersion, onSubmit }: Omit<Props, "open">) {
  const editing = !!sandbox;
  const [name, setName] = useState(sandbox?.name ?? "");
  const [env, setEnv] = useState<Environment>(sandbox ? sandboxEnvironment(sandbox.env) : DEFAULT_SANDBOX_ENV);
  const [parent, setParent] = useState(sandboxes.includes(defaultParent) ? defaultParent : "main");
  const [withRunInput, setWithRunInput] = useState(!editing && run?.input !== undefined);
  const [reviewing, setReviewing] = useState(false);
  const [body, setBody] = useState(run?.input ?? "");
  const [nameProblem, setNameProblem] = useState<string>();
  const [envProblem, setEnvProblem] = useState<string>();
  const [bodyProblem, setBodyProblem] = useState<string>();
  const [saving, setSaving] = useState(false);
  const nameField = useRef<HTMLInputElement>(null);
  const bodyField = useRef<HTMLTextAreaElement>(null);

  const taken = sandboxes.filter((n) => n !== sandbox?.name);
  const slug = sandboxSlug(name);
  const offersRun = !editing && run !== undefined;
  const olderRun = run?.version && latestVersion && run.version !== latestVersion;
  const heading = title ?? (editing ? `Edit ${sandbox.name}` : "New sandbox");
  const action = editing ? "Save" : "Create sandbox";

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({
        name,
        env,
        parent: editing ? undefined : parent,
        runInput: offersRun && withRunInput && run ? { runId: run.runId, body } : undefined,
      });
      onClose();
    } catch (refused) {
      setSaving(false);
      // Back to the form, with the server's reason under the field it names (the name, unless it's the environment).
      setReviewing(false);
      const envReason = fieldErrorOf(refused, "env");
      if (envReason) setEnvProblem(envReason);
      else {
        setNameProblem(fieldErrorOf(refused, "name") ?? firstProblemOf(refused));
        nameField.current?.focus();
      }
    }
  };

  // The button stays enabled: pressed too soon, it says what's missing under the field.
  const submit = () => {
    if (saving) return;
    const problem = sandboxNameError(name, taken);
    if (problem) {
      setNameProblem(problem);
      nameField.current?.focus();
      return;
    }
    if (offersRun && withRunInput) setReviewing(true);
    else void save();
  };

  const confirmReview = () => {
    const problem = describeJsonProblem(body);
    if (problem) {
      setBodyProblem(problem);
      bodyField.current?.focus();
      return;
    }
    void save();
  };

  if (reviewing && run) {
    return (
      <Modal
        open
        title="Check the data before it leaves"
        onClose={onClose}
        widthClass="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewing(false)}>
              Back
            </Button>
            <Button icon={FlaskConical} onClick={confirmReview} aria-disabled={saving}>
              {saving ? "Creating…" : "Create sandbox"}
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Text tone="muted">
            This is a copy of what run <Code>{run.runId}</Code> received. Remove anything that shouldn't leave{" "}
            {parent}. The original is untouched.
          </Text>
          <FormField label="Input to copy into the sandbox" htmlFor="sandbox-run-input" hideLabel error={bodyProblem}>
            <TextArea
              id="sandbox-run-input"
              ref={bodyField}
              rows={14}
              spellCheck={false}
              mono
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setBodyProblem(undefined);
              }}
            />
          </FormField>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal
      open
      title={heading}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {offersRun && withRunInput ? (
            <Button icon={ArrowRight} onClick={submit}>
              Continue
            </Button>
          ) : (
            <Button icon={editing ? undefined : FlaskConical} onClick={submit} aria-disabled={saving}>
              {saving ? (editing ? "Saving…" : "Creating…") : action}
            </Button>
          )}
        </>
      }
    >
      <Stack gap="lg">
        {!editing && (
          <Text tone="muted">
            A sandbox is a copy of the project, its saved dataclips included. Nothing you do in it touches {parent} until
            you promote it.
          </Text>
        )}
        <FormField
          label="Name"
          htmlFor="sandbox-name"
          hint={`Your sandbox will be named ${slug || "my-sandbox"}.`}
          error={nameProblem}
        >
          <TextInput
            id="sandbox-name"
            ref={nameField}
            placeholder="What are you trying out?"
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setNameProblem(undefined);
            }}
          />
        </FormField>
        <FormField
          label="Environment"
          htmlFor="sandbox-env"
          hint="Its runs use credentials' values for this environment."
          error={envProblem}
        >
          <Select
            id="sandbox-env"
            options={ENVIRONMENTS.map((e) => ({ value: e, label: environmentLabels[e] }))}
            value={env}
            onChange={(e) => {
              setEnv(e.target.value as Environment);
              setEnvProblem(undefined);
            }}
          />
        </FormField>
        {!editing && (
          <FormField
            label="Make it from"
            htmlFor="sandbox-parent"
            hint={`It starts as a copy of ${parent}${latestVersion ? ` (${latestVersion}, the version live now)` : ""}, and promotes back into it.`}
          >
            <Select id="sandbox-parent" options={sandboxes} value={parent} onChange={(e) => setParent(e.target.value)} />
          </FormField>
        )}
        {offersRun &&
          (run.input !== undefined ? (
            <Stack gap="xs">
              <Checkbox
                id="sandbox-run-input-choice"
                checked={withRunInput}
                onChange={setWithRunInput}
                label="Start with this run's input"
                hint={`A copy of the data run ${run.runId} received, saved in the sandbox. You check it first.`}
              />
              {withRunInput && olderRun && (
                <Callout variant="warning" title={`This run used ${run.version}`}>
                  {`The sandbox starts from ${latestVersion}, the version live now, because promoting an older one would remove the newer work.`}
                </Callout>
              )}
            </Stack>
          ) : (
            <Text tone="muted" size="xs">
              Run {run.runId}'s input wasn't kept, so there's nothing to copy. Projects that never keep input and output
              data have none to start from.
            </Text>
          ))}
      </Stack>
    </Modal>
  );
}
