import { Link } from "react-router-dom";

const labels = { input: "Input", output: "Output", request_response: "Request/Response" } as const;
const subjects = { input: "step", output: "step", request_response: "channel request" } as const;

/**
 * The dashed "No … Data here!" box for data wiped by the retention policy
 * (viewers.ex `wiped_data_viewer`).
 */
export default function WipedDataViewer({
  dataLabel,
  projectId,
  canEditDataRetention,
  adminContacts = [],
}: {
  dataLabel: keyof typeof labels;
  projectId: string;
  canEditDataRetention: boolean;
  adminContacts?: string[];
}) {
  return (
    <div className="border-2 border-gray-200 border-dashed rounded-lg px-8 pt-6 pb-8 mb-4 flex flex-col">
      <div className="mb-4">
        <div className="h-12 w-12 border-2 border-gray-300 border-solid mx-auto flex items-center justify-center rounded-full text-gray-400">
          <span className="hero-code-bracket w-4 h-4" />
        </div>
      </div>
      <div className="text-center mb-4 text-gray-500">
        <h3 className="font-bold text-lg">No {labels[dataLabel]} Data here!</h3>
        <p className="text-sm">
          {labels[dataLabel]} data for this {subjects[dataLabel]} has not been retained in accordance with your
          project's data storage policy.
        </p>
      </div>
      <div className="text-center text-gray-500 text-sm">
        {canEditDataRetention ? (
          <>
            {dataLabel === "request_response" ? "You can change " : "You can’t rerun this work order, but you can change "}
            <Link to={`/projects/${projectId}/settings#data-storage`} className="text-primary-400 hover:text-primary-500 hover:underline underline-offset-2">
              this policy
            </Link>{" "}
            for future {dataLabel === "request_response" ? "requests" : "runs"}.
          </>
        ) : (
          <>
            Contact one of your{" "}
            <span className="text-primary-400 inline-block" title={adminContacts.join(", ")}>
              project admins
            </span>{" "}
            for more information.
          </>
        )}
      </div>
    </div>
  );
}
