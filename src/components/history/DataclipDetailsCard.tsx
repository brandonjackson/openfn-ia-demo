import type { ReactNode } from "react";
import type { Dataclip } from "../../mock-data/history";
import { uuidOf } from "../../mock-data/history-extra";
import DataclipTypePill from "./DataclipTypePill";
import DateTime from "./DateTime";

/** The "Dataclip Details" metadata card (dataclip_live/show.ex). */
export default function DataclipDetailsCard({ dataclip, updatedAt }: { dataclip: Dataclip; updatedAt?: string }) {
  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Dataclip Details</h3>
      </div>
      <div className="px-6 py-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{uuidOf(dataclip.id)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1">
              <DataclipTypePill type={dataclip.type} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <DateTime value={dataclip.insertedAt} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <DateTime value={updatedAt ?? dataclip.insertedAt} />
            </dd>
          </div>
          {dataclip.wiped && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Wiped</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <DateTime value={updatedAt ?? dataclip.insertedAt} />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

/** The dataclip page's body card: the JSON viewer, or "No Data Available". */
export function DataclipBodyCard({ dataclip, children }: { dataclip: Dataclip; children?: ReactNode }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="h-96 overflow-hidden">
        {dataclip.wiped ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <span className="hero-eye-slash h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No Data Available</h3>
              <p className="mt-1 text-sm text-gray-500">
                This dataclip's data has been wiped in accordance with the project's data retention policy.
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
