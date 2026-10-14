import { useState } from "react";
import Button from "../Button";
import InfoTooltip from "../InfoTooltip";
import SectionHeader from "../SectionHeader";
import Toggle from "../Toggle";
import AddCollaboratorsModal, { type CollaboratorDraft } from "./AddCollaboratorsModal";
import CollaboratorsTable from "./CollaboratorsTable";
import InviteCollaboratorsModal from "./InviteCollaboratorsModal";
import RemoveCollaboratorModal from "./RemoveCollaboratorModal";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { ProjectMember, ProjectRole } from "../../mock-data/projects";
import { findUser, users } from "../../mock-data/users";

interface Props {
  initialMembers: ProjectMember[];
  currentUserId: string;
  initialSupportAccess: boolean;
  canEditProject: boolean;
  canAddProjectUser: boolean;
  canRemoveProjectUser: boolean;
  sandbox?: boolean;
}

type Modal =
  | { kind: "add" }
  | { kind: "invite"; drafts: { email: string; role: ProjectRole | "" }[] }
  | { kind: "remove"; member: ProjectMember }
  | null;

/**
 * The Collaboration tab (`#collaboration`, settings.html.heex:570-679).
 * Adding someone with an existing account adds them to the table; unknown
 * emails go on to the invite modal, as in Lightning. Nothing is persisted.
 */
export default function CollaborationPanel({
  initialMembers,
  currentUserId,
  initialSupportAccess,
  canEditProject,
  canAddProjectUser,
  canRemoveProjectUser,
  sandbox = false,
}: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [supportAccess, setSupportAccess] = useState(initialSupportAccess);
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);
  const memberEmails = members.map((m) => findUser(m.userId)?.email.toLowerCase() ?? "");

  const addCollaborators = (drafts: CollaboratorDraft[]) => {
    const known: ProjectMember[] = [];
    const unknown: CollaboratorDraft[] = [];
    for (const d of drafts) {
      const user = users.find((u) => u.email.toLowerCase() === d.email.toLowerCase());
      if (user) known.push({ userId: user.id, role: d.role as ProjectRole, failureAlert: true, digest: "weekly" });
      else unknown.push(d);
    }
    setMembers([...members, ...known]);
    setModal(unknown.length ? { kind: "invite", drafts: unknown } : null);
  };

  const removing = modal?.kind === "remove" ? findUser(modal.member.userId) : undefined;

  return (
    <>
      <SectionHeader
        title="Project collaboration"
        subtitle="View collaborators and manage alert settings for this project."
        permissionsSection={
          canEditProject ? undefined : "collaboration settings, but you can change your notification preferences."
        }
        action={
          <Button
            id="show_collaborators_modal_button"
            size="lg"
            disabled={!canAddProjectUser}
            tooltip={canAddProjectUser ? undefined : "You are not authorized to perform this action"}
            onClick={() => setModal({ kind: "add" })}
          >
            Add Collaborator(s)
          </Button>
        }
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      {/* settings.ex `support_access_toggle`: only people who can edit the project see it. */}
      {canEditProject && (
        <div className="flex items-center">
          <Toggle checked={supportAccess} onChange={setSupportAccess} label="Grant support access" />
          <InfoTooltip title="Granting support access will allow all designated support users for this Lightning instance to access this project with editor permissions." />
        </div>
      )}

      {modal?.kind === "add" && (
        <AddCollaboratorsModal existingEmails={memberEmails} onCancel={close} onSave={addCollaborators} />
      )}
      {modal?.kind === "invite" && <InviteCollaboratorsModal initial={modal.drafts} onCancel={close} onInvite={close} />}
      {modal?.kind === "remove" && removing && (
        <RemoveCollaboratorModal
          user={removing}
          onCancel={close}
          onConfirm={() => {
            setMembers(members.filter((m) => m.userId !== modal.member.userId));
            close();
          }}
        />
      )}

      <CollaboratorsTable
        members={members}
        currentUserId={currentUserId}
        canRemoveProjectUser={canRemoveProjectUser}
        canAdd={canEditProject}
        onAdd={() => setModal({ kind: "add" })}
        onChange={(updated) => setMembers(members.map((m) => (m.userId === updated.userId ? updated : m)))}
        onRemove={(member) => setModal({ kind: "remove", member })}
      />
    </>
  );
}
