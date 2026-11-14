import { describe, expect, it } from "vitest";
import { isCallableFromStep, serviceStepBody, serviceYaml, type ProjectServiceItem, type StepService } from "./services";
import type { XRoadIdentity } from "./xroad";

const orgXRoad: XRoadIdentity = {
  instance: "FJ",
  memberClass: "GOV",
  memberCode: "MOH",
  memberName: "Ministry of Health",
  subsystems: [{ code: "OPENFN", description: "OpenFn", openfn: true }],
  certificates: [],
  securityServers: [],
};

const api: ProjectServiceItem["api"] = {
  trigger: "webhook",
  invocation: "POST https://app.openfn.org/i/case-surveillance/register-suspected-case",
  outputDescription: "Returns the case ID.",
  outputExample: '{ "caseId": "CASE-1" }',
};

const surveillance: ProjectServiceItem = {
  id: "register-suspected-case",
  name: "Register a suspected case",
  description: "Records a suspected case of a notifiable disease.",
  api,
  xroad: { serviceCode: "register-case", published: true, clients: ["FJ/GOV/NRH/OPENMRS"] },
  record: {
    owner: "Ministry of Health",
    purpose: "Find outbreaks early.",
    dataExchanged: "Sent: disease and the patient's national ID. Returned: case ID.",
    legalBasis: "Public Health Act 2015, s.41",
    classification: "Restricted",
    sla: "99.9% monthly uptime",
    version: "1.2",
    accessConditions: "Health facilities on X-Road.",
  },
};

const planning: ProjectServiceItem = {
  id: "planning-application-intake",
  name: "Submit a planning application",
  description: "Receives planning applications.",
  api: { ...api, invocation: "POST https://app.openfn.org/i/project-a/planning-application-intake" },
};

describe("serviceYaml", () => {
  it("registers a service on X-Road under the Security Server's own fields", () => {
    const yaml = serviceYaml(surveillance, { code: "register-suspected-case", xroad: orgXRoad });
    expect(yaml).toContain("  client_id: FJ:GOV:MOH:OPENFN\n");
    expect(yaml).toContain(
      [
        "  service_description:",
        "    type: REST",
        "    url: https://app.openfn.org/i/case-surveillance/register-suspected-case",
        "    rest_service_code: register-case",
        "    disabled: false",
        "  services:",
        "    - service_code: register-case",
      ].join("\n"),
    );
    expect(yaml).toContain("        - method: POST\n          path: /");
    expect(yaml).toContain("    - id: FJ:GOV:NRH:OPENMRS\n      service_client_type: SUBSYSTEM");
  });

  it("uses the service's own code until it's published, and grants nobody access yet", () => {
    const yaml = serviceYaml(planning, { code: "planning-application-intake", xroad: orgXRoad });
    expect(yaml).toContain("  published: false\n");
    expect(yaml).not.toContain("status:");
    expect(yaml).toContain("    - service_code: planning-application-intake\n");
    expect(yaml).toContain("  access_rights: []\n");
  });

  it("leaves X-Road out when the organisation isn't on it", () => {
    expect(serviceYaml(surveillance, { code: "register-suspected-case" })).not.toContain("x_road:");
  });

  it("quotes values that would read back as something else", () => {
    const yaml = serviceYaml(surveillance, { code: "register-suspected-case", xroad: orgXRoad });
    expect(yaml).toContain('version: "1.2"');
    expect(yaml).toMatch(/data_exchanged: "Sent: disease/);
  });
});

describe("serviceStepBody", () => {
  const withFields: StepService = {
    ...surveillance,
    offeredBy: "Ministry of Health",
    api: {
      ...api,
      auth: "API key in the x-api-key header",
      inputFields: [
        { name: "disease", type: "string", required: true, description: "The suspected disease." },
        { name: "national-id", type: "string", required: false, description: "The patient's national ID." },
      ],
    },
  };

  it("posts the service's input fields to its address, each read from the incoming data", () => {
    const body = serviceStepBody(withFields);
    expect(body).toContain("// Register a suspected case: a service from Ministry of Health.");
    expect(body).toContain("// Authentication: API key in the x-api-key header. Pick the credential that holds it.");
    expect(body).toContain("post('https://app.openfn.org/i/case-surveillance/register-suspected-case', {");
    expect(body).toContain("  // string, required: The suspected disease.\n  disease: $.data.disease,");
    expect(body).toContain('  "national-id": $.data["national-id"],');
  });

  it("passes the incoming data on whole when the service names no fields", () => {
    expect(serviceStepBody({ ...surveillance, offeredBy: "Ministry of Health" })).toContain(
      "post('https://app.openfn.org/i/case-surveillance/register-suspected-case', $.data);",
    );
  });
});

describe("isCallableFromStep", () => {
  it("offers services called over HTTP, never a scheduled one", () => {
    expect(isCallableFromStep(surveillance)).toBe(true);
    expect(isCallableFromStep(planning)).toBe(true);
    expect(isCallableFromStep({ ...surveillance, api: { ...api, trigger: "schedule", invocation: "Every 15 minutes" } })).toBe(false);
  });
});
