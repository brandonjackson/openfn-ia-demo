/** Exporting a project on Lightning's API (api/provisioning.md). */
import { getFile } from "./client";

/** The project as the YAML the CLI and GitHub sync use (`GET /api/provision/yaml`). */
export async function fetchProjectYaml(projectId: string): Promise<string> {
  return (await getFile(`/api/provision/yaml?id=${encodeURIComponent(projectId)}`)).text();
}
