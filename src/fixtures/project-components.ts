/**
 * What the fixture projects' forms, artifacts, AI skills, documents and
 * static websites hold, and the sample keys of the collections listed among
 * their components: the records the fake server seeds them from.
 */
import type { CollectionItem } from "../model/page-data";
import type { ProjectComponent } from "../model/projects";
import { isContentComponentType, starterContent, type CollectionContents, type ComponentContent } from "../model/project-components";

const json = (value: unknown) => JSON.stringify(value, null, 2);

const contents: Record<string, string> = {
  "application-field-mapping": json({
    applicant_name: "given_name",
    applicant_surname: "family_name",
    dob: "date_of_birth",
    consent_given: "consent",
    district_code: "location.district",
  }),
  "planning-submission-form": json({
    title: "Planning application: supporting information",
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "date_of_birth", label: "Date of birth", type: "date", required: true },
      { name: "consent", label: "I agree to my details being shared with the planning authority", type: "yes_no", required: true },
      { name: "location.district", label: "District", type: "select_one", choices: ["ACC", "KMA", "TMA", "STMA"] },
      { name: "supporting_documents", label: "Supporting documents", type: "file", required: false },
    ],
  }),
  "case-mapping": json({
    case_id: "source_case_id",
    "properties.household_size": "household_size",
    "properties.village": "location.village",
    date_modified: "updated_at",
  }),
  "commcare-dhis2-mapping": json({
    trackedEntityType: "MCPQUTHX1Ze",
    attributes: {
      "properties.given_name": "w75KJ2mc4zz",
      "properties.family_name": "zDhUuAYrxNC",
      "properties.dob": "iESIqZ0R0R0",
      "properties.national_id": "AuPLng5hLbE",
    },
    program: "IpHINAT79UW",
  }),
  "planning-officer-guide": `# Planning officer guide

How an application moves from the e-planning portal to a decision.

## When an application arrives

- The portal sends it to OpenFn, which opens a case in case management.
- Check the authority code is right; the lookup is in planning-authority-codes.
- Ask for missing documents through the portal, never by email.

## Making a decision

1. Record the decision on the case.
2. The decision notification workflow tells the applicant within the hour.
3. If the notice bounces, call the applicant and note it on the case.
`,
  "triage-planning-applications": `# Triage planning applications

When to use this skill:

- A new application has arrived and hasn't been routed yet.
- An officer asks which applications need attention first.

Steps:

1. Read the application's type, district and supporting documents.
2. Mark it urgent if it's a listed building, a tree preservation order, or overdue.
3. Suggest the team it goes to, from the authority code.
4. Never decide an application. Say what you'd route and why, and let an officer confirm.
`,
  "application-status-site": `<!doctype html>
<html>
  <head>
    <title>Check your planning application</title>
  </head>
  <body>
    <h1>Check your planning application</h1>
    <p>Enter the reference from your confirmation email, e.g. PA-2026-00412.</p>
    <form action="/status" method="get">
      <label for="ref">Application reference</label>
      <input id="ref" name="ref" required />
      <button type="submit">Check status</button>
    </form>
  </body>
</html>
`,
};

/** What a fixture form, artifact, AI skill, document or static website holds. */
export function componentContent(component: ProjectComponent): string {
  if (!isContentComponentType(component.type)) return "";
  return contents[component.id] ?? starterContent(component.type, component.name);
}

/** Sample keys of the collections listed among the fixture projects' components, by component id. */
export const componentCollectionItems: Record<string, CollectionItem[]> = {
  "planning-authority-codes": [
    { key: "ACC", value: json({ authority: "Accra Metropolitan Assembly", region: "Greater Accra" }), updatedAt: "3 weeks ago" },
    { key: "KMA", value: json({ authority: "Kumasi Metropolitan Assembly", region: "Ashanti" }), updatedAt: "3 weeks ago" },
    { key: "TMA", value: json({ authority: "Tamale Metropolitan Assembly", region: "Northern" }), updatedAt: "3 weeks ago" },
    { key: "STMA", value: json({ authority: "Sekondi-Takoradi Metropolitan Assembly", region: "Western" }), updatedAt: "3 weeks ago" },
  ],
  "district-org-units": [
    { key: "lilongwe", value: json({ orgUnit: "ImspTQPwCqd", facilities: 41 }), updatedAt: "2 days ago" },
    { key: "blantyre", value: json({ orgUnit: "O6uvpzGd5pu", facilities: 37 }), updatedAt: "2 days ago" },
    { key: "mzuzu", value: json({ orgUnit: "fdc6uOvgoji", facilities: 22 }), updatedAt: "2 days ago" },
  ],
  "suspected-cases": [
    { key: "case:SC-2026-0193", value: json({ district: "Lilongwe", onset: "2026-10-28", status: "registered" }), updatedAt: "1 hour ago" },
    { key: "case:SC-2026-0194", value: json({ district: "Zomba", onset: "2026-10-30", status: "registered" }), updatedAt: "40 minutes ago" },
  ],
};

/** What a list of fixture components holds, as the editor is handed it, for stories. */
export function fixtureComponentContents(components: ProjectComponent[]): {
  componentContents: Record<string, ComponentContent>;
  collections: Record<string, CollectionContents>;
} {
  return {
    componentContents: Object.fromEntries(
      components.filter((c) => isContentComponentType(c.type)).map((c) => [c.id, { content: componentContent(c), updatedAt: "3 days ago", updatedBy: "Brandon Jackson" }]),
    ),
    collections: Object.fromEntries(
      components
        .filter((c) => c.type === "Collection")
        .map((c) => {
          const items = componentCollectionItems[c.id] ?? [];
          return [c.id, { items, itemCount: items.length, byteSize: items.reduce((n, i) => n + i.key.length + i.value.length, 0) }];
        }),
    ),
  };
}
