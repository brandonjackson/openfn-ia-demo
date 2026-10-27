import { FileInput, FileOutput, History, ScrollText, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PanelViewId } from "../../editor-layout";

/** The parts of a loaded run that can be opened for a step: what it logged, the data it got and the data it gave. */
export type RunDataSection = "log" | "input" | "output";

/** The views the bottom panel can show, in tab order. */
export const panelViews: { id: PanelViewId; label: string; icon: LucideIcon; description: string }[] = [
  { id: "runs", label: "Runs", icon: History, description: "Recent runs, to load one" },
  { id: "failures", label: "Failures", icon: TriangleAlert, description: "Why runs failed, by reason" },
  { id: "log", label: "Log", icon: ScrollText, description: "What the step wrote in the loaded run" },
  { id: "input", label: "Input", icon: FileInput, description: "The data the step received" },
  { id: "output", label: "Output", icon: FileOutput, description: "The data the step produced" },
];
