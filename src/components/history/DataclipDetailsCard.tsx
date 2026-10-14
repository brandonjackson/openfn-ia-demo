import type { ReactNode } from "react";
import type { Dataclip } from "../../mock-data/history";
import { uuidOf } from "../../mock-data/history-extra";
import Card from "../Card";
import DateTime from "../DateTime";
import { DetailItem, DetailList } from "../DetailList";
import Heading from "../Heading";
import DataclipTypePill from "./DataclipTypePill";

/** The "Dataclip Details" metadata card (dataclip_live/show.ex). */
export default function DataclipDetailsCard({ dataclip, updatedAt }: { dataclip: Dataclip; updatedAt?: string }) {
  return (
    <Card title="Dataclip Details" padding="lg" className="mb-6">
      <DetailList layout="grid">
        <DetailItem label="ID" mono>
          {uuidOf(dataclip.id)}
        </DetailItem>
        <DetailItem label="Type">
          <DataclipTypePill type={dataclip.type} />
        </DetailItem>
        <DetailItem label="Created">
          <DateTime value={dataclip.insertedAt} />
        </DetailItem>
        <DetailItem label="Updated">
          <DateTime value={updatedAt ?? dataclip.insertedAt} />
        </DetailItem>
        {dataclip.wiped && (
          <DetailItem label="Wiped">
            <DateTime value={updatedAt ?? dataclip.insertedAt} />
          </DetailItem>
        )}
      </DetailList>
    </Card>
  );
}

/** The dataclip page's body card: the JSON viewer, or "No Data Available". */
export function DataclipBodyCard({ dataclip, children }: { dataclip: Dataclip; children?: ReactNode }) {
  return (
    <Card padding="none" className="h-96 overflow-hidden">
      {dataclip.wiped ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
          <span className="hero-eye-slash h-12 w-12 text-gray-400" />
          <Heading size="sm" className="mt-2">
            No Data Available
          </Heading>
          <p className="mt-1">This dataclip's data has been wiped in accordance with the project's data retention policy.</p>
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
