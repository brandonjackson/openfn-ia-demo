/**
 * AI Assistant conversations shown in the workflow editor's assistant panel.
 * Static fixtures only: the demo has no assistant behind it.
 */
import type { AISession } from "../types/ai-assistant";

export const aiSessions: AISession[] = [
  {
    id: "ai-1",
    workflowId: "wf-openhie",
    title: "Map CommCare registration to a FHIR Patient",
    updatedAt: "2026-10-14T08:40:00Z",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How do I turn the incoming registration into a FHIR Patient in the first step?",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Read the form fields from `state.data.form` and build the resource with `fn()`. Here's a starting point you can add to the job:",
        code: "fn(state => {\n  const { patient } = state.data.form;\n  state.data = {\n    resourceType: 'Patient',\n    name: [{ given: [patient.given_name], family: patient.family_name }],\n    gender: patient.sex,\n    birthDate: patient.birthdate,\n  };\n  return state;\n});",
      },
    ],
  },
  {
    id: "ai-2",
    workflowId: "wf-openhie",
    title: "Why did the OpenHIM request fail?",
    updatedAt: "2026-10-12T15:10:00Z",
    messages: [
      { id: "m3", role: "user", content: "The send step crashed yesterday, what happened?" },
      {
        id: "m4",
        role: "assistant",
        content: "The run timed out waiting for OpenHIM to respond. Check the endpoint is reachable and consider a timeout option on `post()`.",
      },
    ],
  },
];

export function aiSessionsFor(workflowId: string): AISession[] {
  return aiSessions.filter((s) => s.workflowId === workflowId);
}
