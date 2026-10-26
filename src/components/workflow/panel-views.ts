import { FileInput, FileOutput, History, ScrollText, Settings2, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PanelViewId } from "../../editor-layout";

/** The views the bottom panel can show, in tab order. */
export const panelViews: { id: PanelViewId; label: string; icon: LucideIcon; description: string }[] = [
  { id: "runs", label: "Runs", icon: History, description: "Recent runs, to load one" },
  { id: "failures", label: "Failures", icon: TriangleAlert, description: "Why runs failed, by reason" },
  { id: "step", label: "Step", icon: Settings2, description: "The selected step's settings" },
  { id: "log", label: "Log", icon: ScrollText, description: "What the step wrote in the loaded run" },
  { id: "input", label: "Input", icon: FileInput, description: "The data the step received" },
  { id: "output", label: "Output", icon: FileOutput, description: "The data the step produced" },
];
