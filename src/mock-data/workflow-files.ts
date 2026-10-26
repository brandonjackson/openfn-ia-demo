import type { ProjectComponent, ProjectService } from "./projects";

/**
 * The documents kept alongside a workflow, and previews of the project
 * components it uses, as they appear in the code explorer.
 */

export const workflowDocs = {
  context: `# Context

Background for anyone changing this workflow. The legislation and figures
below are illustrative, written for this demo.

## Legislation

### National Identity Registration Act, 2024 (Act 1098)
- Every citizen aged 15 and over must be registered and hold a national ID.
- s. 12: one person, one record. The registrar must check for an existing
  record before creating a new one, and must not issue a second ID.
- s. 14: an applicant must be told the outcome of their application within
  10 working days, whether an ID was issued or one already exists.
- s. 21: biographic data may only be shared with bodies named in Schedule 2
  (Identity, the e-planning portal, the civil registry).

### Data Protection (Amendment) Act, 2025
- Explicit consent is required before personal data is processed. An
  application without \`consent: "yes"\` must not reach Identity.
- Applications parked for retry may be held for at most 30 days, then
  deleted and the applicant told to reapply.
- Logs must not contain full names together with dates of birth.

### Registration of Births and Deaths Regulations, 2023 (L.I. 2471)
- Children registered at birth get a provisional record in Identity. At 15
  that record is upgraded, not duplicated, so a near-match is expected.

## Who this flow affects

| Group | Share of applications | What to watch for |
| --- | --- | --- |
| First-time adults (15 to 17) | ~45% | Usually hold a provisional birth record; should match and upgrade, not create |
| Adults never registered | ~20% | Often rural; no prior record, so this is where duplicates are most likely if names are spelt differently |
| Re-applicants (lost or damaged ID) | ~18% | Already in Identity; should be told their existing ID, not issued a new one |
| Returning diaspora | ~8% | Names may follow foreign transliteration; dates of birth sometimes recorded day/month swapped |
| Older citizens (65+) | ~6% | Date of birth often unknown; registered as 1 January of the year, which causes false near-matches |
| Persons with disabilities | ~3% | Apply through an assisted channel; notifications must also go to the named assistant |

## What this means for the workflow
- Search Identity before creating anyone (s. 12), and treat a provisional
  birth record as a match to upgrade.
- Near-matches (same name, different date of birth) go to a person for
  review rather than being created or rejected automatically.
- Every run must end in a notification or a queued retry, so the 10-day
  rule (s. 14) can be met.
- Clear the retry queue within 30 days.
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
