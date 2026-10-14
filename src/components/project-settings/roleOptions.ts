import { collaboratorRoles } from "../../mock-data/project-settings";
import { capitalize } from "../../utils/format";

/** The role select's options in the add and invite collaborator modals ("Admin", "Editor", …). */
export const roleOptions = collaboratorRoles.map((r) => [capitalize(r), r] as [string, string]);
