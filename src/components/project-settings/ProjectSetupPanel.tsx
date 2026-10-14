import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../Alert";
import Button from "../Button";
import { Label, TextArea, TextInput } from "../Inputs";
import SectionHeader from "../SectionHeader";
import NameBadge from "../NameBadge";
import PlainSwitch from "./PlainSwitch";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import SettingsCard from "./SettingsCard";
import type { Project } from "../../mock-data/projects";
import { urlSafeName } from "../../utils/urlSafeName";

interface Props {
  project: Project;
  /** Project environment, shown read-only. */
  env: string;
  /** The parent, when `project` is a sandbox. */
  parentProject?: Project;
  canEditProject: boolean;
  canDeleteProject: boolean;
}

/**
 * The Setup tab (`#project`, settings.html.heex:67-313): Project Identity
 * form, Concurrency Override, Export, and the danger zone. Saving only
 * updates local state.
 */
export default function ProjectSetupPanel({ project, env, parentProject, canEditProject, canDeleteProject }: Props) {
  const sandbox = project.parentId !== null;
  const [rawName, setRawName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [savedSerial, setSavedSerial] = useState(project.concurrency === 1);
  const [serial, setSerial] = useState(project.concurrency === 1);
  const name = urlSafeName(rawName);
  const concurrencyChanged = serial !== savedSerial;

  return (
    <>
      <SectionHeader
        title={sandbox ? "Sandbox setup" : "Project setup"}
        subtitle={
          sandbox
            ? "Sandboxes are isolated copies of a project for safe experimentation."
            : "Projects are isolated workspaces that contain workflows, accessible to certain users."
        }
        permissionsSection={canEditProject ? undefined : "basic settings, but you can export a copy."}
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      <div className="space-y-4">
        <SettingsCard
          title={sandbox ? "Sandbox Identity" : "Project Identity"}
          description={
            sandbox ? (
              <>
                Identifies this sandbox within its parent:{" "}
                {parentProject && (
                  <Link
                    to={`/projects/${parentProject.id}/settings`}
                    className="font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    {parentProject.name}
                  </Link>
                )}
              </>
            ) : (
              "This metadata helps you identify the types of workflows managed in this project and the people that have access."
            )
          }
        >
          <form id="project-settings-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="project-settings-form_raw_name">Project name</Label>
              <TextInput
                id="project-settings-form_raw_name"
                value={rawName}
                disabled={!canEditProject}
                onChange={(e) => setRawName(e.target.value)}
                errors={name ? [] : ["can't be blank"]}
              />
              <small className="mt-2 block text-xs text-gray-600">
                <NameBadge name={name}>Your project will be named</NameBadge>
              </small>
            </div>
            <div>
              <Label htmlFor="project-settings-form_env">Project environment</Label>
              <TextInput id="project-settings-form_env" value={env} disabled readOnly />
              <small className="mt-2 block text-xs text-gray-600">
                Credentials will be loaded with values from this environment.
              </small>
            </div>
            <div>
              <TextArea
                id="project-settings-form_description"
                label="Project description"
                value={description}
                disabled={!canEditProject}
                maxLength={240}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-xs sm:text-sm border-secondary-300 rounded-md"
              />
              <small className="mt-2 block text-xs text-gray-600">
                A short description of a project (max 240 characters)
              </small>
            </div>
            <div>
              <Button id="project-identity-submit-btn" type="submit" disabled={!(name && canEditProject)}>
                Save
              </Button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard
          title="Concurrency Override"
          description={
            <span className="block @container">
              <span className="block @sm:max-w-xl">
                <span className="block text-xs text-gray-600">
                  By default, runs are executed concurrently in accordance to limits set on individual workflows. In
                  some situations, you may want to prevent concurrent execution across all workflows in a project.
                </span>
                <span className="block mt-2 text-xs text-gray-600">
                  Disabling parallel run execution ensures that only one run is executed at a time, regardless of
                  workflow, for this entire project.
                </span>
              </span>
            </span>
          }
        >
          <form
            id="project-concurrency-form"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSavedSerial(serial);
            }}
          >
            <div>
              <div className="flex items-center">
                <PlainSwitch
                  id="project-concurrency-switch"
                  checked={serial}
                  onChange={setSerial}
                  disabled={!canEditProject}
                  labelledBy="concurrency-description"
                />
                <span className="ml-3 text-sm" id="concurrency-description">
                  <span className="font-medium text-gray-900">Disable parallel execution</span>{" "}
                  <span className="text-gray-500">(No more than one run at a time)</span>
                </span>
              </div>
              {serial && concurrencyChanged && (
                <Alert type="warning" header="Heads Up!" className="mt-2">
                  <p>Disabling parallel run execution may significantly reduce the overall throughput of your project.</p>
                </Alert>
              )}
            </div>
            <div>
              <Button id="project-concurrency-submit-btn" type="submit" disabled={!(concurrencyChanged && canEditProject)}>
                Save
              </Button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard
          title="Export your Project"
          description="Export your project as code, to save this version or edit your project locally."
        >
          <Button>Export project</Button>
        </SettingsCard>

        {canDeleteProject && (
          <SettingsCard
            title="The danger zone"
            description={
              sandbox
                ? "Deleting this sandbox is irreversible. It removes every workflow, trigger, version, keychain clone, and dataclip that lives only inside it."
                : "Deleting your project is irreversible"
            }
          >
            <Button theme="danger" to={`/projects/${project.id}/settings/delete`}>
              {sandbox ? "Delete sandbox" : "Delete project"}
            </Button>
          </SettingsCard>
        )}
      </div>
    </>
  );
}
