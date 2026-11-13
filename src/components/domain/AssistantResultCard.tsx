import { Check, Database, FlaskConical, Minus, X, XCircle } from "lucide-react";
import type { AssistantResult } from "../../model/assistant";
import Button from "../primitives/Button";
import Card from "../primitives/Card";

interface Props {
  result: AssistantResult;
  onOpenRuns?: () => void;
  /** Opens the workflow's test cases, for a result about tests it wrote. */
  onOpenTests?: () => void;
  /** Asks to promote the sandbox; unset on main. */
  onAskToMerge?: () => void;
}

const outcomeStyle = {
  ok: { Icon: Database, mark: <Check size={14} className="text-green-600" /> },
  skipped: { Icon: X, mark: <Minus size={14} className="text-red-400" /> },
  failed: { Icon: XCircle, mark: <X size={14} className="text-red-500" /> },
};

/**
 * What happened when the assistant made and tested a change: a line per
 * outcome, then "Open runs" to see the test runs and "Ask to merge" to
 * promote the sandbox. For test cases it wrote (`about: "tests"`), a line
 * per test and "Open test cases" instead of the runs.
 */
export default function AssistantResultCard({ result, onOpenRuns, onOpenTests, onAskToMerge }: Props) {
  const tests = result.about === "tests";
  return (
    <Card padding="sm">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">Result</div>
      <ul className="divide-y divide-gray-100">
        {result.items.map((item) => {
          const { Icon: OutcomeIcon, mark } = outcomeStyle[item.outcome];
          const Icon = tests ? FlaskConical : OutcomeIcon;
          return (
            <li key={item.label} className="flex items-center gap-2.5 py-2 text-sm text-gray-800">
              <Icon size={14} className="text-gray-400" />
              <span className="flex-1">{item.label}</span>
              {mark}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <Button variant="secondary" size="sm" className="rounded-lg" onClick={tests ? onOpenTests : onOpenRuns}>
          {tests ? "Open test cases" : "Open runs"}
        </Button>
        {onAskToMerge && (
          <Button variant="dark" size="sm" className="rounded-lg" onClick={onAskToMerge}>
            Ask to merge
          </Button>
        )}
      </div>
    </Card>
  );
}
