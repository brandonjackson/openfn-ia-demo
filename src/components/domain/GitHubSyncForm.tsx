import { useState } from "react";
import { GitBranch } from "lucide-react";
import type { GitHubConnectionSettings, GitHubInstallation } from "../../model/page-data";
import { syncCommitFiles, syncDirections, type SyncDirection } from "../../model/project-settings";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Checkbox from "../primitives/Checkbox";
import FormField from "../primitives/FormField";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import TextLink from "../primitives/TextLink";
import { RadioOption, Select, TextInput } from "../primitives/FormControls";

interface Props {
  /** The project's id, which names the files the sync commits. */
  projectId: string;
  /** The GitHub App installations your account can use. */
  installations: GitHubInstallation[];
  /** The current connection, when changing it; leave it out to connect for the first time. */
  initial?: GitHubConnectionSettings;
  /** Connects the branch and starts the first sync. Resolves once connected. */
  onConnect: (settings: GitHubConnectionSettings) => Promise<void>;
  /** Backs out of changing an existing connection. */
  onCancel?: () => void;
  /** Turns the form off, e.g. when you can't change the project's version control. */
  disabled?: boolean;
}

/**
 * Connects a project to a GitHub branch, as Lightning's sync setup does: pick
 * an installation, a repository and a branch, which way the first sync goes,
 * and where the config lives, then accept the files it will commit.
 */
export default function GitHubSyncForm({ projectId, installations, initial, onConnect, onCancel, disabled = false }: Props) {
  const [installationId, setInstallationId] = useState(initial?.installationId ?? "");
  const [repo, setRepo] = useState(initial?.repo ?? "");
  const [branch, setBranch] = useState(initial?.branch ?? "");
  const [direction, setDirection] = useState<SyncDirection>(initial?.syncDirection ?? "pull");
  const [configPath, setConfigPath] = useState(initial?.configPath ?? "");
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const installation = installations.find((i) => i.id === installationId);
  const repository = installation?.repos.find((r) => r.fullName === repo);
  const deploy = direction === "deploy";
  const valid = !!installation && !!repository && !!branch && (!deploy || !!configPath.trim()) && accepted;

  const submit = async () => {
    setSaving(true);
    await onConnect({ installationId, repo, branch, configPath: configPath.trim(), syncDirection: direction });
    setSaving(false);
  };

  return (
    <Stack gap="lg">
      <Stack gap="md">
        <FormField label="GitHub installation" htmlFor="gh-installation">
          <Select
            id="gh-installation"
            fullWidth
            disabled={disabled}
            placeholder="Select an installation"
            options={installations.map((i) => ({ value: i.id, label: `${i.account} (${i.id})` }))}
            value={installationId}
            onChange={(e) => {
              setInstallationId(e.target.value);
              setRepo("");
              setBranch("");
            }}
          />
        </FormField>
        <FormField
          label="Repository"
          htmlFor="gh-repo"
          hint={
            <>
              Can't find the right installation or repository?{" "}
              <TextLink variant="inline" href="https://github.com/apps/openfn">
                Create or update GitHub installations, or change their permissions.
              </TextLink>
            </>
          }
        >
          <Select
            id="gh-repo"
            fullWidth
            disabled={disabled || !installation}
            placeholder="Select a repository"
            options={(installation?.repos ?? []).map((r) => r.fullName)}
            value={repo}
            onChange={(e) => {
              setRepo(e.target.value);
              setBranch("");
            }}
          />
        </FormField>
        <FormField label="Branch" htmlFor="gh-branch">
          <Select
            id="gh-branch"
            fullWidth
            disabled={disabled || !repository}
            placeholder="Select a branch"
            options={repository?.branches ?? []}
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </FormField>
      </Stack>

      <Stack gap="sm">
        <Text tone="strong">Initial setup</Text>
        <Text tone="muted" size="xs" block>
          Choose the direction of the first sync: export this project to GitHub, or import an existing project from GitHub.
        </Text>
        {(Object.keys(syncDirections) as SyncDirection[]).map((d) => (
          <RadioOption
            key={d}
            name="gh-sync-direction"
            value={d}
            disabled={disabled}
            label={syncDirections[d].label}
            hint={syncDirections[d].description}
            checked={direction === d}
            onChange={() => setDirection(d)}
          />
        ))}
      </Stack>

      <FormField label={deploy ? "Path to config (required)" : "Path to config (optional)"} htmlFor="gh-config">
        <TextInput
          id="gh-config"
          disabled={disabled}
          placeholder={`./openfn-${projectId}-config.json`}
          value={configPath}
          onChange={(e) => setConfigPath(e.target.value)}
        />
      </FormField>

      {repository && branch && (
        <Callout variant={deploy ? "danger" : "warning"} title="Before you connect">
          <Checkbox
            checked={accepted}
            onChange={setAccepted}
            disabled={disabled}
            label={`I understand that ${deploy ? "my current OpenFn project will be destroyed and " : ""}the following files will be committed to ${repo}`}
            hint="Existing versions of these files on these branches will be overwritten (but will still exist in git history)."
          />
          <Stack gap="xs">
            {syncCommitFiles(projectId, branch, repository.defaultBranch, configPath).map((f) => (
              <Text key={f.path} size="xs" mono>
                {f.path} → {f.branch}
              </Text>
            ))}
          </Stack>
        </Callout>
      )}

      <Inline gap="sm">
        <Button icon={GitBranch} disabled={disabled || !valid || saving} onClick={submit}>
          {initial ? "Save and sync" : "Connect branch & initiate first sync"}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Inline>
    </Stack>
  );
}
