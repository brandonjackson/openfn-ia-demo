import type { Project } from "../../mock-data/projects";

interface Props {
  /** Project scope (project settings › Credentials). Omit for the user's /credentials page. */
  project?: Project;
}

/**
 * The shared credential index (annotations/shared/shared-credential-index-component.md):
 * OAuth clients, credentials and keychain credentials, used on /credentials
 * and in project settings. Placeholder: being built.
 */
export default function CredentialIndex({ project }: Props) {
  return <p className="text-sm text-gray-500">Credential index{project ? ` for ${project.name}` : ""}: not built yet.</p>;
}
