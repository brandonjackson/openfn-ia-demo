import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useContextLayers, useOrganization, useOrganizationMembers, useOrganizationSaves, useOrganizationXRoad } from "../../api/organization";
import { combine } from "../../api/status";
import { organizationRoles } from "../../model/organization";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { useAnnounceOutcome } from "../../app/announce";
import { pageFrame } from "../../app/page-frame";

/**
 * Feeds Organization settings: its name (which admins change) and members from the API's
 * organizations, and what the demo adds (visibility defaults, who manages the
 * Security Server, context layers, billing) from the demo's own routes. The
 * rest of the X-Road identity is read from its own route (the X-Road operator
 * sets it, not this page). Admins get the actions; members read. Someone in
 * no organisation is told it isn't there. What the feature flags turn off is
 * left out.
 */
export default function OrganizationSettingsPageQuery({ route }: { route: PageRoute }) {
  const flags = useFlags();
  const { status, organization: org } = useOrganization();
  const { status: membersStatus, members } = useOrganizationMembers(org?.id);
  const { status: layersStatus, layers } = useContextLayers();
  const { status: xroadStatus, xroad } = useOrganizationXRoad(flags.xroad);
  const saves = useOrganizationSaves(org?.id);
  const announcing = useAnnounceOutcome();
  const loaded = combine(status, membersStatus, layersStatus, xroadStatus);

  return (
    <Loaded status={loaded.state === "ready" && !org ? { state: "notFound" } : loaded} path={route.currentPath}>
      {() => {
        const o = org!;
        const manage = o.canManage;
        const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "That member";
        return (
          <OrganizationSettingsPage
            {...pageFrame(route)}
            data={{
              name: o.name,
              members,
              // Without a feature, there's nothing of it to set a default for.
              visibility: {
                projects: o.visibility.projects,
                systems: flags.connectedSystems ? o.visibility.systems : undefined,
                services: flags.serviceCatalog ? o.visibility.services : undefined,
              },
              contextLayers: layers,
              xroad: xroad && { ...xroad, managedBy: o.managedBy },
              xroadUsage: o.xroadUsage,
              billing: o.billing,
            }}
            assignableRoles={manage ? organizationRoles : undefined}
            // Forms show a refusal under their fields, so only their success is announced.
            onRename={manage ? (name) => announcing(saves.rename(name), { success: `Your organisation is now called ${name}.` }) : undefined}
            onInviteMember={manage ? (invite) => announcing(saves.invite(invite), { success: `Added ${invite.email}.` }) : undefined}
            onChangeMemberRole={
              manage
                ? (id, role) =>
                    announcing(saves.changeRole(id, role), {
                      success: `${nameOf(id)} is now ${role === "Admin" ? "an admin" : "a member"}.`,
                      failure: `${nameOf(id)}'s role didn't change`,
                    })
                : undefined
            }
            onRemoveMember={
              manage
                ? (id) => announcing(saves.remove(id), { success: `Removed ${nameOf(id)} from the organisation.`, failure: `${nameOf(id)} wasn't removed` })
                : undefined
            }
            onSaveVisibility={
              manage
                ? (v) =>
                    announcing(saves.saveVisibility(v), {
                      success: "New projects, systems and services start with these defaults.",
                      failure: "The defaults weren't saved",
                    })
                : undefined
            }
            onSaveSecurityServerManager={
              manage
                ? (by) =>
                    announcing(saves.saveSecurityServerManager(by), {
                      success: "Who manages your Security Server is updated.",
                      failure: "The X-Road settings weren't saved",
                    })
                : undefined
            }
            onRequestContextAccess={manage ? (url) => announcing(saves.requestContextLayer(url), { success: "Access requested. It waits for approval." }) : undefined}
            onRemoveContextLayer={manage ? (id) => announcing(saves.removeContextLayer(id), { success: "Context layer removed.", failure: "The context layer wasn't removed" }) : undefined}
          />
        );
      }}
    </Loaded>
  );
}
