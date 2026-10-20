import { useState } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
import type { Dataclip, RunDetails } from "../mock-data/workflow";
import { describeJsonProblem } from "../json-input";
import Modal from "./Modal";
import Button from "./Button";
import { RadioOption, TextArea, TextInput } from "./FormControls";
import ListRow from "./ListRow";
import DataclipList from "./workflow/DataclipList";

/** The data a new sandbox starts with. */
export type SandboxStart =
  | { kind: "nothing" }
  /** A reviewed copy of the selected run's input. */
  | { kind: "run"; body: string; runId: string }
  | { kind: "saved"; dataclip: Dataclip };

type Choice = SandboxStart["kind"];
type Step = "choose" | "review";

/** Step results stay where they were made; requests and saved inputs can be copied. */
const canTravel = (dataclip: Dataclip) => dataclip.type !== "step_result";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Sandboxes already open in the project, which you can join instead. */
  sandboxes: string[];
  /** The run being followed, whose input the sandbox can start from. */
  run?: RunDetails;
  /** That run's input; missing when the project doesn't keep inputs. */
  runInput?: Dataclip;
  /** The version live on main now, which a new sandbox starts from. */
  latestVersion?: string;
  /** Dataclips in the project; named ones can be brought into the sandbox. */
  dataclips: Dataclip[];
  onCreate: (sandbox: { name: string; start: SandboxStart }) => void;
  onJoin: (sandbox: string) => void;
  /** Start on a given step and choice (useful for stories). */
  defaultStep?: Step;
  defaultChoice?: Choice;
  defaultName?: string;
}

/**
 * "Edit in sandbox": make a new sandbox to change the workflow in, or join
 * one already open.
 *
 * A new sandbox can start with data to run against: nothing, the input of the
 * run you're looking at, or one of the project's named inputs. Taking a run's
 * input adds a review step first, so anything that shouldn't leave main can
 * be removed from the copy.
 */
export default function EditInSandboxModal({ open, ...rest }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <EditInSandboxForm {...rest} />;
}

function EditInSandboxForm({
  onClose,
  sandboxes,
  run,
  runInput,
  latestVersion,
  dataclips,
  onCreate,
  onJoin,
  defaultStep = "choose",
  defaultChoice,
  defaultName = "",
}: Omit<Props, "open">) {
  const [step, setStep] = useState<Step>(defaultStep);
  const [name, setName] = useState(defaultName);
  const [choice, setChoice] = useState<Choice>(defaultChoice ?? (run ? "run" : "nothing"));
  const [saved, setSaved] = useState<Dataclip | undefined>();
  const [reviewBody, setReviewBody] = useState(runInput?.body ?? "");

  const trimmed = name.trim();
  const nameTaken = sandboxes.includes(trimmed) || trimmed === "main";
  const named = dataclips.filter((d) => d.name);
  const travelling = named.filter(canTravel);
  const runInputMissing = choice === "run" && !runInput;
  const olderRun = run && latestVersion && run.version !== latestVersion;
  const reviewProblem = step === "review" ? describeJsonProblem(reviewBody) : null;

  const canContinue =
    trimmed.length > 0 && !nameTaken && !runInputMissing && (choice !== "saved" || saved !== undefined);

  const create = () => {
    if (choice === "run" && run) onCreate({ name: trimmed, start: { kind: "run", body: reviewBody, runId: run.runId } });
    else if (choice === "saved" && saved) onCreate({ name: trimmed, start: { kind: "saved", dataclip: saved } });
    else onCreate({ name: trimmed, start: { kind: "nothing" } });
  };

  const versionNote = olderRun && (
    <p className="text-xs text-amber-700">
      This run used {run.version}. The sandbox starts from {latestVersion}, the version live now, because promoting an
      older one would remove the newer work.
    </p>
  );

  if (step === "review") {
    return (
      <Modal
        open
        title="Check the data before it leaves main"
        onClose={onClose}
        widthClass="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStep("choose")}>
              Back
            </Button>
            <Button icon={FlaskConical} disabled={Boolean(reviewProblem)} onClick={create}>
              Create sandbox
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This is a copy of what run <code className="font-mono text-gray-900">{run?.runId}</code> received. Remove
            anything that shouldn't leave main. The original is untouched.
          </p>
          <TextArea
            aria-label="Input to copy into the sandbox"
            rows={14}
            spellCheck={false}
            className="font-mono text-xs"
            value={reviewBody}
            onChange={(e) => setReviewBody(e.target.value)}
          />
          {reviewProblem && <p className="text-xs text-red-600">{reviewProblem}</p>}
          {versionNote}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      title="Edit in sandbox"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {choice === "run" ? (
            <Button icon={ArrowRight} disabled={!canContinue} onClick={() => setStep("review")}>
              Continue
            </Button>
          ) : (
            <Button icon={FlaskConical} disabled={!canContinue} onClick={create}>
              Create sandbox
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          A sandbox is a copy of this project. Nothing you do in it touches main until you promote it back.
        </p>

        <section className="space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Create a new sandbox</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Starts from {latestVersion ? `${latestVersion}, ` : ""}the version live now.
            </p>
          </div>
          <div>
            <TextInput
              aria-label="Sandbox name"
              placeholder="What are you trying out?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {nameTaken && <p className="mt-1 text-xs text-red-600">A sandbox with this name exists already.</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Start with</legend>
            <RadioOption
              name="sandbox-start"
              label="Nothing"
              hint="An empty sandbox. Pick input when you run."
              checked={choice === "nothing"}
              onChange={() => setChoice("nothing")}
            />
            {run && (
              <RadioOption
                name="sandbox-start"
                label="This run's input"
                hint={`A copy of the data run ${run.runId} received. You check it first.`}
                checked={choice === "run"}
                onChange={() => setChoice("run")}
              />
            )}
            <RadioOption
              name="sandbox-start"
              label="A saved input"
              hint="One of this project's named inputs."
              checked={choice === "saved"}
              onChange={() => setChoice("saved")}
            />
          </fieldset>

          {runInputMissing && (
            <p className="text-xs text-amber-700">
              This run's input was not kept, so there is nothing to copy. Projects that never retain input and output
              data have none to start from.
            </p>
          )}
          {choice === "run" && versionNote}
          {choice === "saved" && (
            <DataclipList
              dataclips={travelling}
              selectedId={saved?.id}
              onSelect={setSaved}
              groupName="sandbox-saved-input"
              emptyMessage={
                named.length > 0
                  ? "None of this project's named inputs can be copied into a sandbox. A step result cannot travel."
                  : "This project has no named inputs yet. Name an input to reuse it here."
              }
            />
          )}
        </section>

        {sandboxes.length > 0 && (
          <section className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Continue in a sandbox</h3>
              <p className="mt-0.5 text-xs text-gray-500">Pick up where someone left off, in a sandbox already open.</p>
            </div>
            <ul className="space-y-2">
              {sandboxes.map((sandbox) => (
                <li key={sandbox}>
                  <ListRow
                    icon={FlaskConical}
                    title={sandbox}
                    monoTitle
                    onClick={() => onJoin(sandbox)}
                    trailing={
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-blue-600">
                        Join <ArrowRight size={14} />
                      </span>
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
