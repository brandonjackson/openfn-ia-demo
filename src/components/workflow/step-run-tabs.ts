export type StepRunTab = "log" | "input" | "output" | "run";

/** The tabs a step's run tray offers, in order. */
export const stepRunTabs: { id: StepRunTab; label: string }[] = [
  { id: "log", label: "Log" },
  { id: "input", label: "Input" },
  { id: "output", label: "Output" },
  { id: "run", label: "Run" },
];
