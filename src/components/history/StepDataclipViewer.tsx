import type { Dataclip, Step } from "../../mock-data/history";
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
      <div className="m-2 relative rounded-md p-12 text-center col-span-full">
        <span className="relative inline-flex">
          <div className="inline-flex">No {inputOrOutput} state could be saved for this run.</div>
        </span>
      </div>
    ) : (
      <div className="relative rounded-md text-xs @md:text-base p-12 text-center bg-slate-700 font-mono text-gray-200">
        <TextPingLoader>Nothing yet</TextPingLoader>
      </div>
    );
  }
  return (
    <div className="flex-grow h-full min-h-96">
      <JsonViewer value={dataclip.body} />
    </div>
  );
}
