import type { Dataclip, DataclipType } from "./workflow";

/** What each kind of dataclip is called on screen. */
export const dataclipTypeLabels: Record<DataclipType, string> = {
  http_request: "Request",
  step_result: "Step result",
  saved_input: "Saved input",
};

/** A saved dataclip's name and description, as its title and description are edited. */
export interface DataclipChanges {
  name: string;
  description: string;
}

/** A new saved dataclip: an input written by hand, or one brought into a sandbox. */
export interface DataclipDraft extends DataclipChanges {
  /** Pretty-printed JSON. */
  body: string;
}

/**
 * A project's saved dataclips: the named ones, which are kept to run with
 * again. The same dataclip can come more than once (each workflow's history
 * lists it), so each is kept once, in the order given.
 */
export function savedDataclips(dataclips: Dataclip[]): Dataclip[] {
  const seen = new Set<string>();
  return dataclips.filter((d) => {
    if (!d.name || seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

/** A name for a new saved dataclip no other has: "Untitled dataclip", "Untitled dataclip 2"… */
export function untitledDataclipName(taken: Dataclip[]): string {
  const names = new Set(taken.flatMap((d) => (d.name ? [d.name.toLowerCase()] : [])));
  let name = "Untitled dataclip";
  for (let n = 2; names.has(name.toLowerCase()); n++) name = `Untitled dataclip ${n}`;
  return name;
}

/** The name a reviewed copy of a run's input takes when it's brought into a sandbox. */
export const runInputName = (runId: string) => `Input from run ${runId}`;
