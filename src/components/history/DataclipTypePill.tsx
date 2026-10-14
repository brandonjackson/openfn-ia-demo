import type { DataclipType } from "../../mock-data/history";
import Pill, { type PillColor } from "../Pill";

const TYPE_COLORS: Record<DataclipType, PillColor> = {
  step_result: "purple",
  http_request: "green",
  global: "blue",
  saved_input: "yellow",
  kafka: "green",
};

/** A dataclip's type as a coloured mono pill (Common.dataclip_type_pill). */
export default function DataclipTypePill({ type }: { type: DataclipType }) {
  return (
    <Pill color={TYPE_COLORS[type] ?? "gray"} mono>
      {type}
    </Pill>
  );
}
