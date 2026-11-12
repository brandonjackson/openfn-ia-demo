import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import CodeBlock from "../../components/primitives/CodeBlock";
import Grid from "../../components/primitives/Grid";
import Inline from "../../components/primitives/Inline";
import Text from "../../components/primitives/Text";

interface ExampleProps {
  /** The real components, drawn live. */
  children: ReactNode;
  /** The code that draws them, shown under the preview. */
  code?: string;
  /** Lays the preview out in a column rather than a wrapping row. */
  column?: boolean;
  /** A grey backdrop, for things that sit on a page (cards, rows, surfaces). */
  backdrop?: boolean;
}

/** A live preview of real components, with the code that draws them. */
export function Example({ children, code, column = false, backdrop = false }: ExampleProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className={`${backdrop ? "bg-gray-50" : "bg-white"} p-6`}>
        {column ? <div className="flex flex-col gap-4">{children}</div> : <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
      {code && (
        <div className="border-t border-gray-200 [&>div]:rounded-none [&>div]:border-0">
          <CodeBlock code={code.trim()} tone="light" />
        </div>
      )}
    </div>
  );
}

interface GuidanceProps {
  /** What to do, drawn live. */
  doExample: ReactNode;
  doText: ReactNode;
  /** What not to do, drawn live. */
  dontExample: ReactNode;
  dontText: ReactNode;
}

/** A "Do" beside a "Don't", each with a live example and a line on why. */
export function DoDont({ doExample, doText, dontExample, dontText }: GuidanceProps) {
  const half = (good: boolean, example: ReactNode, text: ReactNode) => (
    <div className={`overflow-hidden rounded-lg border-t-4 ${good ? "border-green-600" : "border-red-600"} bg-white ring-1 ring-gray-200`}>
      <div className="flex min-h-28 flex-wrap items-center justify-center gap-3 bg-gray-50 p-6">{example}</div>
      <div className="space-y-1 p-4">
        <Inline gap="xs">
          {good ? <Check size={16} className="text-green-700" /> : <X size={16} className="text-red-600" />}
          <Text tone={good ? "success" : "danger"}>
            <strong>{good ? "Do" : "Don't"}</strong>
          </Text>
        </Inline>
        <Text block>{text}</Text>
      </div>
    </div>
  );
  return (
    <Grid columns={2}>
      {half(true, doExample, doText)}
      {half(false, dontExample, dontText)}
    </Grid>
  );
}
