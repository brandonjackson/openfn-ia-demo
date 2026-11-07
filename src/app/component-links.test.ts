import { describe, expect, it } from "vitest";
import { apiChannelId, apiCollectionId, apiComponentId, apiWorkflowId } from "../fixtures/ids";
import { apiProjectId } from "../fixtures/projects";
import { componentLinkTarget } from "./component-links";

const project = apiProjectId("project-a");

describe("componentLinkTarget", () => {
  it("sends an old link to a channel, collection or document on to its id, by the project's slug or its id", () => {
    expect(componentLinkTarget("/projects/project-a/components/eplanning-submission-received")).toBe(
      `/projects/${project}/components/${apiChannelId("project-a", "eplanning-submission-received")}`,
    );
    expect(componentLinkTarget(`/projects/${project}/components/planning-authority-codes`)).toBe(
      `/projects/${project}/components/${apiCollectionId("project-a", "planning-authority-codes")}`,
    );
    expect(componentLinkTarget("/projects/project-a/components/planning-officer-guide/")).toBe(
      `/projects/${project}/components/${apiComponentId("project-a", "planning-officer-guide")}`,
    );
  });

  it("opens a workflow's old link in the editor", () => {
    expect(componentLinkTarget("/projects/project-a/components/planning-application-workflow")).toBe(
      `/workflow-editor/${apiWorkflowId("planning-application-workflow")}`,
    );
  });

  it("leaves links by id, unknown slugs and other pages alone", () => {
    expect(componentLinkTarget(`/projects/${project}/components/${apiChannelId("project-a", "eplanning-submission-received")}`)).toBeUndefined();
    expect(componentLinkTarget("/projects/project-a/components/no-such-thing")).toBeUndefined();
    expect(componentLinkTarget("/projects/project-a/components")).toBeUndefined();
    expect(componentLinkTarget("/projects/project-a/workflows")).toBeUndefined();
    // Another project's workflow isn't one of this project's components.
    expect(componentLinkTarget("/projects/project-b/components/planning-application-workflow")).toBeUndefined();
  });
});
