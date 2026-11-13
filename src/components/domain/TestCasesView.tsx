import { useState } from "react";
import { ArrowRight, Database, FlaskConical, Pencil, Play, Plus, Sparkles, SquareCode, Trash2 } from "lucide-react";
import {
  checksOf,
  testStateLabels,
  testTally,
  type TestCase,
  type TestGeneration,
  type TestResult,
  type TestState,
} from "../../model/test-cases";
import { errorMessageOf } from "../../model/form-error";
import ActionMenu from "../primitives/ActionMenu";
import Badge, { type BadgeTone } from "../primitives/Badge";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Card from "../primitives/Card";
import ConfirmModal from "../primitives/ConfirmModal";
import DataSnippet from "../primitives/DataSnippet";
import EmptyState from "../primitives/EmptyState";
import Grid from "../primitives/Grid";
import Inline from "../primitives/Inline";
import ScrollPane from "../primitives/ScrollPane";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import StatusPill from "./StatusPill";

/** A step of the workflow, to name where a test starts and stops. */
export interface TestStep {
  id: string;
  label: string;
}

interface Props {
  /** The workflow's test cases, oldest first. */
  tests: TestCase[];
  /** The workflow's steps, in the order they run, to name where each test starts and stops. */
  steps: TestStep[];
  /** Runs one; resolves with how it went, or rejects with why it couldn't run. Left out where nothing can be run. */
  onRun?: (id: string) => Promise<TestResult | void>;
  /** Opens the form for a new one. Left out where you can't, e.g. on main. */
  onCreate?: () => void;
  /** Opens one's form to edit it. Left out where you can't. */
  onEdit?: (test: TestCase) => void;
  /** Deletes one; resolves once it's gone. Left out where you can't. */
  onDelete?: (id: string) => Promise<void>;
  /** Has the assistant sync the tests with the spec: a test, with deterministic tests, for each requirement nothing covers. Left out where you can't. */
  onGenerate?: () => Promise<TestGeneration>;
  /** Which tests are running, when the caller already knows (useful for stories). */
  defaultRunning?: string[];
}

const stateTones: Record<TestState, BadgeTone> = { passed: "green", failed: "red", running: "indigo", not_run: "gray" };

/**
 * A workflow's test cases: scenarios that say in plain words what goes in
 * and what should come out, which the assistant runs. For each it makes an
 * input to match the description (or takes a saved dataclip), runs the
 * workflow from the start step to the end, and checks what came out, by
 * judging it against the description, by running the test's deterministic
 * tests, or both. "Run all tests" at the top runs them one after another;
 * each runs alone from its own Run. "Generate from spec" has the assistant
 * sync them with spec.md, writing deterministic tests by default. Shown in
 * the workflow editor's code view, from the explorer's Workflow group.
 */
export default function TestCasesView({ tests, steps, onRun, onCreate, onEdit, onDelete, onGenerate, defaultRunning = [] }: Props) {
  const [running, setRunning] = useState<ReadonlySet<string>>(() => new Set(defaultRunning));
  const [runningAll, setRunningAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger" | "info"; title: string; body?: string }>();
  const [refusals, setRefusals] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<TestCase>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const tally = testTally(tests, running);

  const mark = (id: string, on: boolean) =>
    setRunning((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  /** Runs one, keeping its refusal under it; resolves with whether it passed. */
  async function runOne(id: string): Promise<boolean | undefined> {
    if (!onRun || running.has(id)) return undefined;
    mark(id, true);
    setRefusals((r) => Object.fromEntries(Object.entries(r).filter(([key]) => key !== id)));
    try {
      const result = await onRun(id);
      return result ? result.status === "passed" : undefined;
    } catch (error) {
      setRefusals((r) => ({ ...r, [id]: errorMessageOf(error) }));
      return false;
    } finally {
      mark(id, false);
    }
  }

  async function runAll() {
    if (runningAll || tests.length === 0) return;
    setRunningAll(true);
    setNotice(undefined);
    let passed = 0;
    for (const t of tests) if (await runOne(t.id)) passed += 1;
    setRunningAll(false);
    setNotice(
      passed === tests.length
        ? { tone: "success", title: `All ${tests.length} tests passed` }
        : { tone: "danger", title: `${tests.length - passed} of ${tests.length} tests failed`, body: "Open a failed test to see what the assistant made of the output." },
    );
  }

  async function generate() {
    if (!onGenerate || generating) return;
    setGenerating(true);
    setNotice(undefined);
    try {
      const g = await onGenerate();
      const wrote = g.created === 0 ? "Every requirement already has a test." : `Wrote ${g.created} new ${g.created === 1 ? "test" : "tests"} with deterministic tests.`;
      const covered = g.upToDate > 0 && g.created > 0 ? ` ${g.upToDate} ${g.upToDate === 1 ? "requirement was" : "requirements were"} already covered.` : "";
      const gone = g.notInSpec > 0 ? ` ${g.notInSpec} ${g.notInSpec === 1 ? "test covers a requirement" : "tests cover requirements"} no longer in the spec.` : "";
      setNotice({ tone: g.notInSpec > 0 ? "info" : "success", title: "Synced with spec.md", body: `${wrote}${covered}${gone}` });
    } catch (error) {
      setNotice({ tone: "danger", title: "The tests weren't generated", body: errorMessageOf(error) });
    } finally {
      setGenerating(false);
    }
  }

  async function confirmDelete() {
    if (!deleting || !onDelete || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await onDelete(deleting.id);
      setDeleting(undefined);
    } catch (error) {
      setRefusals((r) => ({ ...r, [deleting.id]: errorMessageOf(error) }));
      setDeleting(undefined);
    } finally {
      setDeleteBusy(false);
    }
  }

  const stepName = (id: string | undefined, fallback: string) => (id ? (steps.find((s) => s.id === id)?.label ?? "A step that's gone") : fallback);

  return (
    <ScrollPane>
      <Stack gap="lg">
        <SectionHeading
          title="Test cases"
          description="Say in plain words what goes in and what should come out. The assistant makes inputs to match, judges the output, runs your deterministic tests, or all three."
          action={
            <Inline gap="sm" wrap>
              {onGenerate && (
                <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => void generate()} aria-disabled={generating}>
                  {generating ? "Generating…" : "Generate from spec"}
                </Button>
              )}
              {onCreate && (
                <Button size="sm" variant="secondary" icon={Plus} onClick={onCreate}>
                  New test case
                </Button>
              )}
              {onRun && tests.length > 0 && (
                <Button size="sm" icon={Play} onClick={() => void runAll()} aria-disabled={runningAll}>
                  {runningAll ? "Running tests…" : "Run all tests"}
                </Button>
              )}
            </Inline>
          }
        />

        {notice && (
          <Callout variant={notice.tone} title={notice.title} role="status">
            {notice.body}
          </Callout>
        )}

        {tests.length === 0 ? (
          <Card>
            <EmptyState
              icon={FlaskConical}
              title="No test cases yet"
              description="Describe a scenario in plain words, or have the assistant write tests for each requirement in spec.md."
            />
          </Card>
        ) : (
          <Stack gap="md">
            <Inline gap="sm" wrap>
              {(["passed", "failed", "running", "not_run"] as const)
                .filter((s) => tally[s] > 0)
                .map((s) => (
                  <Badge key={s} tone={stateTones[s]} label={`${tally[s]} ${testStateLabels[s].toLowerCase()}`} />
                ))}
            </Inline>
            {tests.map((t) => (
              <TestCaseCard
                key={t.id}
                test={t}
                running={running.has(t.id)}
                refusal={refusals[t.id]}
                from={stepName(t.startStepId, "First step")}
                to={stepName(t.endStepId, "Final output")}
                onRun={onRun ? () => void runOne(t.id) : undefined}
                onEdit={onEdit ? () => onEdit(t) : undefined}
                onDelete={onDelete ? () => setDeleting(t) : undefined}
              />
            ))}
          </Stack>
        )}
      </Stack>
      <ConfirmModal
        open={deleting !== undefined}
        title={`Delete ${deleting?.name ?? "this test"}?`}
        confirmLabel={deleteBusy ? "Deleting…" : "Delete test case"}
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleting(undefined)}
      >
        It won't run with the others any more. Generating from the spec writes a test for its requirement again, if it had one.
      </ConfirmModal>
    </ScrollPane>
  );
}

function TestCaseCard({
  test: t,
  running,
  refusal,
  from,
  to,
  onRun,
  onEdit,
  onDelete,
}: {
  test: TestCase;
  running: boolean;
  refusal?: string;
  from: string;
  to: string;
  onRun?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const state: TestState = running ? "running" : (t.lastResult?.status ?? "not_run");
  const menu = [
    ...(onEdit ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
    ...(onDelete ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const }] : []),
  ];
  const assertions = t.assertions?.split("\n") ?? [];
  const result = running ? undefined : t.lastResult;

  return (
    <Card
      title={t.name}
      description={t.requirement ? `From spec.md: ${t.requirement}` : t.origin === "you" ? "Written by you" : "Written by the assistant"}
      actions={
        <Inline gap="xs">
          {running ? <StatusPill status="running" /> : <Badge tone={stateTones[state]} label={testStateLabels[state]} />}
          {menu.length > 0 && <ActionMenu label={`Actions for ${t.name}`} items={menu} onSelect={(id) => (id === "edit" ? onEdit?.() : onDelete?.())} />}
          {onRun && (
            <Button size="sm" variant="secondary" icon={Play} onClick={onRun} aria-disabled={running}>
              {running ? "Running…" : "Run"}
            </Button>
          )}
        </Inline>
      }
    >
      <Stack gap="md">
        {!t.inSpec && (
          <Callout variant="warning" title="Its requirement is no longer in the spec">
            Edit it to cover something the spec still asks for, or delete it.
          </Callout>
        )}
        {refusal && <Callout variant="danger" title={refusal} role="alert" />}
        <Grid columns={2} gap="md">
          <Stack gap="xs">
            <SectionHeading title="Input" variant="label" compact />
            <Text size="sm">{t.inputDescription || "As the dataclip has it."}</Text>
            <Inline gap="xs" wrap>
              {t.input.kind === "dataclip" ? (
                <Badge shape="tag" icon={Database} label={`Dataclip: ${t.input.dataclipName ?? "deleted"}`} />
              ) : (
                <Badge shape="tag" tone="indigo" icon={Sparkles} label="Generated by the assistant" />
              )}
            </Inline>
          </Stack>
          <Stack gap="xs">
            <SectionHeading title="Expected output" variant="label" compact />
            <Text size="sm">{t.outputDescription}</Text>
            <Inline gap="xs" wrap>
              {checksOf(t).map((c) => (
                <Badge key={c} shape="tag" tone={c === "AI judge" ? "indigo" : "gray"} icon={c === "AI judge" ? Sparkles : SquareCode} label={c} />
              ))}
            </Inline>
          </Stack>
        </Grid>
        <Inline gap="xs" wrap>
          <Text size="xs" tone="muted">
            Runs from
          </Text>
          <Text size="xs">{from}</Text>
          <ArrowRight size={12} aria-hidden />
          <Text size="xs">{to}</Text>
        </Inline>
        {assertions.length > 0 && (
          <DataSnippet
            title="Deterministic tests"
            lines={assertions}
            meta={`${assertions.length} ${assertions.length === 1 ? "line" : "lines"}`}
            previewLines={3}
            tone="light"
            // Once it has run, its checks list each line, so the code waits behind its chevron.
            defaultOpen={!t.lastResult}
            expanded={codeOpen}
            onExpand={() => setCodeOpen(true)}
            onCollapse={() => setCodeOpen(false)}
            expandLabel="Show all of it"
          />
        )}
        {result && <ResultDetails result={result} inputOpen={inputOpen} onInputOpen={setInputOpen} generated={t.input.kind === "generated"} />}
      </Stack>
    </Card>
  );
}

/** How the test went the last time it ran: the verdict, each check, and the input it ran with. */
function ResultDetails({
  result,
  generated,
  inputOpen,
  onInputOpen,
}: {
  result: TestResult;
  generated: boolean;
  inputOpen: boolean;
  onInputOpen: (open: boolean) => void;
}) {
  const passed = result.status === "passed";
  const lines = result.input.split("\n");
  return (
    <Callout variant={passed ? "success" : "danger"} title={`${passed ? "Passed" : "Failed"} ${result.ranAt.toLowerCase()}`}>
      {result.verdict && <p>{result.verdict}</p>}
      {result.checks.length > 0 && (
        <Stack gap="xs" label="Checks">
          {result.checks.map((c, i) => (
            <Inline key={i} gap="sm" align="center">
              <StatusPill status={c.passed ? "success" : "failed"} variant="mark" />
              <Text size="xs" mono={c.label.startsWith("expect(")}>
                {c.label}
              </Text>
            </Inline>
          ))}
        </Stack>
      )}
      {result.steps.length > 0 && (
        <Text size="xs" tone="muted">
          Walked {result.steps.join(", then ")}.
        </Text>
      )}
      <DataSnippet
        title={generated ? "Input the assistant made" : "Input"}
        lines={lines}
        meta={`${lines.length} ${lines.length === 1 ? "line" : "lines"}`}
        previewLines={4}
        tone="light"
        defaultOpen={false}
        expanded={inputOpen}
        onExpand={() => onInputOpen(true)}
        onCollapse={() => onInputOpen(false)}
        expandLabel="Show all of it"
      />
    </Callout>
  );
}
