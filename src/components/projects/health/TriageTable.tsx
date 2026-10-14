import { Link } from "react-router-dom";
import type { ErrorSignature, FailureState } from "../../../mock-data/workflow-health";
import { cn } from "../../../utils/cn";
import { EMPTY, FAILURE_COLORS, adaptorLabel } from "./palette";

// One tip per error type the worker reports (TriageTable.tsx `TIPS`).
const TIPS: Record<string, string> = {
  RuntimeError: "Job code hit a value it didn't expect, often a missing input field.",
  JobError: "The job code intentionally threw this error.",
  AdaptorError: "An error occurred while an adaptor operation was underway.",
  CompileError: "Job code couldn't be compiled, so no step ever ran.",
  RuntimeCrash: "Job code threw an error the runtime couldn't recover from, so the run was abandoned.",
  ReferenceError: "Job code referred to something that doesn't exist, often a typo or a missing import.",
  SyntaxError: "Job code tried to parse text that wasn't in the format it expected, most often JSON.",
  ValidationError: "The workflow or a job isn't in a shape the runtime accepts, so nothing ran.",
  ImportError: "A module or adaptor the job imports couldn't be loaded, so nothing ran.",
  EdgeConditionError: "An edge condition failed to evaluate, so the run couldn't pick a next step.",
  InputError: "The run's starting input couldn't be used, so nothing ran.",
  DataClipError: "The run's input data couldn't be loaded, so no step ever started.",
  ExitError: "The process running this workflow exited before finishing.",
  OOMError: "The run used more memory than it's allowed and was stopped.",
  StateTooLargeError: "The state passed between steps grew past its size limit.",
  TimeoutError: "The run hit its time limit and was stopped part-way through.",
  SecurityError: "The job tried something the worker doesn't allow and was stopped.",
  AutoinstallError: "The adaptor this workflow needs couldn't be installed, so nothing ran.",
  CredentialLoadError: "A credential couldn't be loaded, so no step could authenticate.",
  ExecutionError: "Something failed inside OpenFn rather than in this workflow.",
  LostAfterClaim: "The run was picked up but never started, so nothing ran.",
  LostAfterStart: "The run started but never reported back, so how far it got is unknown.",
  RunLimitExceeded: "The project was over its run limit, so no run was created for this request.",
  default: "The step failed without a recognised error type; check its logs.",
};

const OUTCOMES: Partial<Record<string, FailureState>> = {
  fail: "failed",
  crash: "crashed",
  kill: "killed",
  exception: "exception",
  lost: "lost",
  rejected: "rejected",
};

const TH = "px-3 py-3.5 first:pl-6 last:pr-6 text-left text-sm font-medium whitespace-nowrap text-gray-800";
const TD = "px-3 py-4 first:pl-6 last:pr-6 text-sm text-gray-500";

const errorTypeOf = ({ error_type }: ErrorSignature) => error_type || "unknown";

function Signature({ signature }: { signature: ErrorSignature }) {
  const state = OUTCOMES[signature.exit_reason];
  const color = state && FAILURE_COLORS[state];
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-2 font-medium text-gray-900 capitalize">
        {color && <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
        {state ?? errorTypeOf(signature)}
      </p>
      <p className="border-l-2 border-gray-300 pl-2 font-mono text-gray-900" style={{ borderColor: color }}>
        {signature.exit_reason}:{errorTypeOf(signature)}
        {signature.step_name && ` @ ${signature.step_name}`}
      </p>
      {signature.adaptor && <p className="font-mono text-gray-500">{adaptorLabel(signature.adaptor)}</p>}
    </div>
  );
}

/**
 * "Triage - grouped by failure type": failed work orders grouped by error
 * signature, largest first, each with a suggestion and a link to History.
 * Sits in a padded card and bleeds to its edges (TriageTable.tsx).
 */
export default function TriageTable({
  signatures,
  emptyMessage,
  historyHref,
}: {
  signatures: ErrorSignature[];
  emptyMessage: string;
  historyHref: string;
}) {
  if (signatures.length === 0) return <p className={EMPTY}>{emptyMessage}</p>;
  return (
    <div className="-m-6 overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className={cn(TH, "w-1/8")}>
              Work orders
            </th>
            <th scope="col" className={TH}>
              Signature
            </th>
            <th scope="col" className={TH}>
              Suggestion
            </th>
            <th scope="col" className={TH}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {signatures.map((s) => (
            <tr
              key={[s.exit_reason, s.error_type, s.step_name, s.adaptor, s.job_id].join("|")}
              className="transition-colors duration-150 hover:bg-gray-50"
            >
              <td className={TD}>
                <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-medium tabular-nums text-gray-700">
                  {s.count.toLocaleString()}
                </span>
              </td>
              <td className={TD}>
                <Signature signature={s} />
              </td>
              <td className={TD}>{(s.error_type && TIPS[s.error_type]) || TIPS.default}</td>
              <td className={TD}>
                {s.exit_reason && (
                  <Link
                    to={historyHref}
                    className="inline-block whitespace-nowrap rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:inset-ring-gray-400"
                  >
                    View history
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
