import type { ProjectComponent, ProjectService } from "./projects";

/**
 * The documents kept alongside a workflow, and previews of the project
 * components it uses, as they appear in the code explorer.
 */

export const workflowDocs = {
  plan: `# Plan

## Goal
Issue a national ID to every eligible applicant without creating duplicates
in Identity.

## Approach
1. Search Identity for an existing citizen before creating one.
2. Notify the applicant if an ID already exists.
3. Otherwise create the citizen, then confirm with the issued ID.
4. Park anything Identity rejects so it can be retried.

## Open questions
- Should near-matches (same name, different date of birth) be reviewed by a person?
- How long do queued applications wait before someone is paged?
`,
  spec: `# Spec

## Trigger
Webhook. The e-planning portal POSTs one application per request.

## Input
\`\`\`json
{ "given_name": "Amara", "family_name": "Okafor", "date_of_birth": "1991-03-14", "consent": "yes" }
\`\`\`

## Steps
| Step | Adaptor | Writes |
| --- | --- | --- |
| Search for duplicate citizens in Identity | http | state.matches, state.exactMatch |
| Notify applicant of existing national ID | http | state.notified |
| Create new citizen in Identity | http | state.nationalId |
| Send confirmation notification with national ID | http | state.notified |
| Queue application for retry | common | state.queuedForRetry |

## Done when
Every run ends with either a notification sent or the application queued.
`,
};

/** What a component looks like when opened from the explorer. */
export function componentPreview(component: ProjectComponent): string {
  switch (component.type) {
    case "Collection":
      return JSON.stringify(
        [
          { key: "ACC", value: { authority: "Accra Metropolitan Assembly", region: "Greater Accra" } },
          { key: "KMA", value: { authority: "Kumasi Metropolitan Assembly", region: "Ashanti" } },
          { key: "TMA", value: { authority: "Tamale Metropolitan Assembly", region: "Northern" } },
          { key: "STMA", value: { authority: "Sekondi-Takoradi Metropolitan Assembly", region: "Western" } },
        ],
        null,
        2
      );
    case "Artifact":
      return JSON.stringify(
        {
          applicant_name: "given_name",
          applicant_surname: "family_name",
          dob: "date_of_birth",
          consent_given: "consent",
          district_code: "location.district",
        },
        null,
        2
      );
    case "Form":
      return `# ${component.name}\n\n${component.description}\n\nFields:\n- full_name (text, required)\n- date_of_birth (date, required)\n- consent (yes / no, required)\n- location.district (select one)\n- supporting_documents (file, optional)`;
    case "Channel":
      return `# ${component.name}\n\n${component.description}\n\nPayload:\n\`\`\`json\n{ "id": "string", "submitted_at": "ISO 8601", "data": {} }\n\`\`\``;
    default:
      return `# ${component.name}\n\n${component.description}`;
  }
}

/** A published service's listing, as service.md in the code explorer. */
export function serviceListing(service: ProjectService): string {
  const api = service.api;
  const lines = [`# ${service.name}`, "", service.description, "", `Status: ${service.status}`];
  if (!api) return [...lines, "", "No API published yet. Publishing the service generates one from the workflow.", ""].join("\n");
  lines.push("", "## How to call it", api.trigger === "webhook" ? `\`${api.invocation}\`` : api.invocation);
  if (api.auth) lines.push("", `Auth: ${api.auth}`);
  if (api.inputFields?.length) {
    lines.push("", "## Input", "| Field | Type | Required | Description |", "| --- | --- | --- | --- |");
    for (const f of api.inputFields) lines.push(`| ${f.name} | ${f.type} | ${f.required ? "yes" : "no"} | ${f.description} |`);
  }
  if (api.requestExample) lines.push("", "## Example request", "```bash", api.requestExample, "```");
  lines.push("", "## Output", api.outputDescription, "", "```json", api.outputExample, "```", "");
  return lines.join("\n");
}
