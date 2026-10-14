import { collaboratorRoles } from "../../mock-data/project-settings";

/** The role select's options in the add and invite collaborator modals ("Admin", "Editor", …). */
export const roleOptions = collaboratorRoles.map((r) => [r.charAt(0).toUpperCase() + r.slice(1), r] as [string, string]);
