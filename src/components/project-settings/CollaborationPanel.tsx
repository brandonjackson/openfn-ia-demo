import { useState } from "react";
import Button from "../Button";
import InfoTooltip from "../InfoTooltip";
import SectionHeader from "../SectionHeader";
import { useToast } from "../Toast";
import Toggle from "../Toggle";
import AddCollaboratorsModal, { type CollaboratorDraft } from "./AddCollaboratorsModal";
import CollaboratorsTable from "./CollaboratorsTable";
import InviteCollaboratorsModal from "./InviteCollaboratorsModal";
import RemoveCollaboratorModal from "./RemoveCollaboratorModal";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { ProjectMember, ProjectRole } from "../../types/projects";
import type { User } from "../../types/users";

interface Props {
  initialMembers: ProjectMember[];
  /** The instance's users: members' details, and who "Add" can find by email. */
  users: User[];
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
  users,
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
  const toast = useToast();
  const findUser = (id: string) => users.find((u) => u.id === id);
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
    toast(addedMessage(known.length, unknown.length));
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
          <Toggle
            checked={supportAccess}
            onChange={(on) => {
              setSupportAccess(on);
              toast(
                on ? "Granted access to support users successfully" : "Revoked access to support users successfully"
              );
            }}
            label="Grant support access"
          />
          <InfoTooltip title="Granting support access will allow all designated support users for this Lightning instance to access this project with editor permissions." />
        </div>
      )}

      {modal?.kind === "add" && (
        <AddCollaboratorsModal existingEmails={memberEmails} onCancel={close} onSave={addCollaborators} />
      )}
      {modal?.kind === "invite" && (
        <InviteCollaboratorsModal
          initial={modal.drafts}
          onCancel={close}
          onInvite={(invites) => {
            close();
            toast(`Invite${invites.length > 1 ? "s" : ""} sent successfully`);
          }}
        />
      )}
      {modal?.kind === "remove" && removing && (
        <RemoveCollaboratorModal
          user={removing}
          onCancel={close}
          onConfirm={() => {
            setMembers(members.filter((m) => m.userId !== modal.member.userId));
            close();
            toast("Collaborator removed");
          }}
        />
      )}

      <CollaboratorsTable
        members={members}
        users={users}
        currentUserId={currentUserId}
        canRemoveProjectUser={canRemoveProjectUser}
        canAdd={canEditProject}
        onAdd={() => setModal({ kind: "add" })}
        onChange={(updated) => {
          setMembers(members.map((m) => (m.userId === updated.userId ? updated : m)));
          // Lightning's own spelling (project_live/settings.ex).
          toast("Project user updated successfuly");
        }}
        onRemove={(member) => setModal({ kind: "remove", member })}
      />
    </>
  );
}

/** new_collaborator_component.ex `generate_flash_message`: existing accounts are added, the rest are invited. */
function addedMessage(existing: number, unknown: number) {
  if (unknown === 0) return `Collaborator${existing === 1 ? "" : "s"} added successfully`;
  if (existing === 0) {
    return unknown === 1
      ? "This collaborator does not have an OpenFn account. Invite them to join OpenFn and grant access to the project."
      : "These collaborators do not have OpenFn accounts. Invite them to join OpenFn and grant them access to the project.";
  }
  const total = existing + unknown;
  return `${existing} out of ${total} collaborator${total === 1 ? "" : "s"} have OpenFn accounts and have been added to your project. You can invite others to join OpenFn and grant them access to this project.`;
}
