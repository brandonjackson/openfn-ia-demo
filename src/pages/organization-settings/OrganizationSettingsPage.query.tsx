import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useContextLayers, useOrganization, useOrganizationMembers, useOrganizationSaves, useOrganizationXRoad } from "../../api/organization";
import { combine } from "../../api/status";
import { organizationRoles } from "../../model/organization";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { pageFrame } from "../../app/page-frame";

/**
 * Feeds Organization settings from the demo's organisation routes: members,
 * visibility defaults, who manages the Security Server, and context layers
 * save there. The rest of the X-Road identity is read from its own route (the
 * X-Road operator sets it, not this page). Owners and admins get the actions;
 * anyone else reads. What the feature flags turn off is left out.
 */
export default function OrganizationSettingsPageQuery({ route }: { route: PageRoute }) {
  const flags = useFlags();
  const { status, organization: org } = useOrganization();
  const { status: membersStatus, members } = useOrganizationMembers();
  const { status: layersStatus, layers } = useContextLayers();
  const { status: xroadStatus, xroad } = useOrganizationXRoad(flags.xroad);
  const saves = useOrganizationSaves();

  return (
    <Loaded status={combine(status, membersStatus, layersStatus, xroadStatus)} path={route.currentPath}>
      {() => {
        const o = org!;
        const manage = o.canManage;
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
            assignableRoles={o.canManageOwners ? organizationRoles : organizationRoles.filter((r) => r !== "Owner")}
            onInviteMember={manage ? saves.invite : undefined}
            onChangeMemberRole={manage ? saves.changeRole : undefined}
            onRemoveMember={manage ? saves.remove : undefined}
            onSaveVisibility={manage ? (v) => saves.saveVisibility(v) : undefined}
            onSaveSecurityServerManager={manage ? saves.saveSecurityServerManager : undefined}
            onRequestContextAccess={manage ? saves.requestContextLayer : undefined}
            onRemoveContextLayer={manage ? saves.removeContextLayer : undefined}
          />
        );
      }}
    </Loaded>
  );
}
