import type { Dataclip, Step } from "../../types/history";
import JsonViewer from "./JsonViewer";
import TextPingLoader from "./TextPingLoader";
import WipedDataViewer from "./WipedDataViewer";

/**
 * A selected step's input or output on the run page (viewers.ex
 * `step_dataclip_viewer`): the wiped box, a "could not be saved" note,
 * "Nothing yet" while running, or the JSON body.
 */
export default function StepDataclipViewer({
  step,
  dataclip,
  inputOrOutput,
  runFinished,
  projectId,
  canEditDataRetention,
}: {
  step: Step | undefined;
  dataclip: Dataclip | undefined;
  inputOrOutput: "input" | "output";
  runFinished: boolean;
  projectId: string;
  canEditDataRetention: boolean;
}) {
  const field = inputOrOutput === "input" ? step?.inputDataclipId : step?.outputDataclipId;
  const wiped = dataclip?.wiped || (step?.finishedAt && !field);
  if (wiped) {
    return <WipedDataViewer dataLabel={inputOrOutput} projectId={projectId} canEditDataRetention={canEditDataRetention} />;
  }
  if (!dataclip) {
    return runFinished ? (
      <div className="m-2 p-12 text-center">No {inputOrOutput} state could be saved for this run.</div>
    ) : (
      <div className="rounded-md bg-gray-700 p-12 text-center font-mono text-xs text-gray-200 @md:text-base">
        <TextPingLoader>Nothing yet</TextPingLoader>
      </div>
    );
  }
  return (
    <div className="h-full min-h-96 grow">
      <JsonViewer value={dataclip.body} />
    </div>
  );
}
