import { useState } from "react";
import { Check, Folder, UserPlus, Users } from "lucide-react";
import type { OtherProject } from "../../model/projects";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Inline from "../primitives/Inline";
import ListRow from "../primitives/ListRow";

interface Props {
  project: OtherProject;
  /** Asks to join it. Left out, there's no button (a request already made still says Requested). */
  onRequestToJoin?: () => Promise<void>;
}

/**
 * A project on the instance you aren't in, under Projects' "Other projects":
 * its name, description, owner and size. It doesn't open; its button asks to
 * join, says so while it runs, and once asked it shows Requested.
 */
export default function OtherProjectRow({ project, onRequestToJoin }: Props) {
  const [busy, setBusy] = useState(false);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  /** Asks once at a time; the wrapper says how it went. */
  const ask = async () => {
    if (busy || !onRequestToJoin) return;
    setBusy(true);
    try {
      await onRequestToJoin();
    } catch {
      // Refused: the wrapper said why.
    } finally {
      setBusy(false);
    }
  };

  return (
    <ListRow
      icon={Folder}
      title={project.name}
      description={project.description || undefined}
      meta={
        <>
          <Inline gap="xs">
            <Users size={11} />
            {plural(project.memberCount, "member")}
          </Inline>
          {project.ownerName && <span>Owned by {project.ownerName}</span>}
        </>
      }
      actions={
        project.joinRequested ? (
          <Badge label="Requested" icon={Check} tone="gray" />
        ) : (
          onRequestToJoin && (
            <Button variant="secondary" size="sm" icon={UserPlus} aria-disabled={busy} onClick={() => void ask()}>
              {busy ? "Requesting…" : "Request to join"}
            </Button>
          )
        )
      }
    />
  );
}
