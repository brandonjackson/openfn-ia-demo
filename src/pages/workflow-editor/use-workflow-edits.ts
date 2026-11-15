import { useEffect, useRef, useState } from "react";
import type { AdaptorInfo } from "../../model/adaptor-reference";
import { firstProblemOf } from "../../model/form-error";
import type { AdaptorKind, Workflow } from "../../model/workflow";
import { applyEdits, noEdits, type Edits } from "../../model/workflow-edits";

/** How long after the last change edits are saved. */
const SAVE_AFTER_MS = 700;

/**
 * The editor's unsaved work: the edits made since the last save and the
 * workflow's name as typed, on top of `workflow` as the server last sent it.
 *
 * Where they can be saved (`onSave` given: a sandbox), edits are saved a
 * moment after the last change. Once saved they're in `workflow`, so they're
 * cleared, unless more were made meanwhile. A refused save says why through
 * `onNote` ("Not saved: …") and the edits stay, to go with the next one.
 *
 * When `workflow` becomes another copy (another sandbox, or main), its own
 * edits start afresh, and `onOtherCopy` is told what was showing, so what
 * was open can be found in the new copy.
 */
export function useWorkflowEdits({
  workflow,
  info,
  onSave,
  onNote,
  onOtherCopy,
}: {
  /** The workflow as the server last sent it. */
  workflow: Workflow;
  /** Each adaptor's details, for a re-adaptored step's package. */
  info: Record<AdaptorKind, AdaptorInfo>;
  /** Saves the workflow as edited. Left out where edits aren't saved (main, or nowhere to save to). */
  onSave?: (edited: Workflow) => Promise<void>;
  /** Says why a save was refused, or with undefined that the last one went through. */
  onNote: (note: string | undefined) => void;
  /** Another copy of the workflow is now shown; `previous` is the one that was, edits included. */
  onOtherCopy: (previous: Workflow) => void;
}) {
  const [edits, setEdits] = useState<Edits>(noEdits);
  const [name, setName] = useState(workflow.name);

  const [shown, setShown] = useState(workflow);
  if (shown.id !== workflow.id) {
    const previous = applyEdits(shown, edits, name, info);
    setShown(workflow);
    setEdits(noEdits);
    setName(workflow.name);
    onOtherCopy(previous);
  }

  const unsaved = edits !== noEdits || name !== workflow.name;
  // A save asked for by hand is the only one going: the timer leaves it to it.
  const savingNow = useRef(false);

  /** Saves `saving` and clears it, unless more edits were made meanwhile. Answers whether the save went through. */
  const save = async (saving: Edits): Promise<boolean> => {
    if (!onSave) return true;
    try {
      await onSave(applyEdits(workflow, saving, name, info));
    } catch (e) {
      onNote(`Not saved: ${firstProblemOf(e)}`);
      return false;
    }
    onNote(undefined);
    setEdits((current) => (current === saving ? noEdits : current));
    return true;
  };

  useEffect(() => {
    if (!onSave || !unsaved) return;
    const timer = setTimeout(() => {
      if (!savingNow.current) void save(edits);
    }, SAVE_AFTER_MS);
    return () => clearTimeout(timer);
    // `save` is made anew each render from exactly these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edits, name, workflow, onSave, info]);

  return {
    /** The edits not yet saved. */
    edits,
    /** Makes a change: `change((e) => withCode(e, stepId, body))`. */
    change: (next: (e: Edits) => Edits) => setEdits(next),
    /** The workflow's name as typed. */
    name,
    setName,
    /** The workflow as edited: what's shown, and what a save sends. */
    latest: applyEdits(workflow, edits, name, info),
    /**
     * Saves whatever isn't saved yet, now, e.g. before a run. Answers whether
     * the server has the workflow as shown: true with nothing to save, false
     * when the save was refused (and `onNote` said why).
     */
    saveNow: async (): Promise<boolean> => {
      if (!onSave || !unsaved) return true;
      savingNow.current = true;
      try {
        return await save(edits);
      } finally {
        savingNow.current = false;
      }
    },
  };
}
