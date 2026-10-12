import type { HandbookFile, HandbookPageData, WikiSection } from "../page-data";
import { currentInstance } from "./user";

const MB = 1024 * 1024;

export const handbookSections: WikiSection[] = [
  {
    id: "about",
    title: "About us",
    blocks: [
      {
        type: "paragraph",
        content: [
          `${currentInstance.name} is the digital transformation unit that connects the ministry's health, civil registration and planning systems. We build and run the integrations that move data between partner systems, so that programme teams can work from one consistent picture instead of reconciling spreadsheets.`,
        ],
      },
      {
        type: "paragraph",
        content: [
          "Most of our work lives in ",
          { text: "Projects", to: "/projects" },
          ". Each project owns its workflows and talks to the outside world through ",
          { text: "connected systems", to: "/connected-systems" },
          " that the organization shares.",
        ],
      },
      {
        type: "facts",
        rows: [
          { label: "Parent organization", value: ["Acme Health Ministry"] },
          { label: "Programmes", value: ["Community health; civil registration; planning"] },
          { label: "Working hours", value: ["Mon to Fri, 08:00 to 17:00 CAT"] },
        ],
      },
    ],
  },
  {
    id: "partners",
    title: "Who we integrate with",
    blocks: [
      {
        type: "paragraph",
        content: [
          "Every external system has an owner on the partner side and an agreement that says what data we may move, how often, and who we call when it breaks.",
        ],
      },
      {
        type: "facts",
        rows: [
          {
            label: "DHIS2",
            value: [
              { text: "National HMIS", to: "/connected-systems/dhis2" },
              ", owned by the Ministry's M&E directorate. Data sharing agreement signed March 2025.",
            ],
          },
          {
            label: "CommCare",
            value: [
              { text: "Community health worker app", to: "/connected-systems/commcare" },
              ", run by the CHW programme team. Referral data only.",
            ],
          },
          {
            label: "OpenCRVS",
            value: [
              { text: "Civil registration", to: "/connected-systems/opencrvs" },
              ", owned by the Registrar General. Births and deaths, read-only.",
            ],
          },
          {
            label: "FHIR Server",
            value: [
              { text: "Shared health record", to: "/connected-systems/fhir" },
              ", piloted with two district hospitals.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "conventions",
    title: "Conventions",
    blocks: [
      {
        type: "list",
        items: [
          ["Name workflows in kebab-case after what they do, e.g. ", "chw-referral-workflow", "."],
          ["Build and test in a sandbox; only merge to main after a run succeeds against staging credentials."],
          [
            "Production credentials belong to the organization, never to a person. Add them to the ",
            { text: "system", to: "/connected-systems" },
            ", not to your personal vault.",
          ],
          ["Every project has at least two collaborators who receive failure alerts."],
        ],
      },
    ],
  },
  {
    id: "support",
    title: "When something breaks",
    blocks: [
      {
        type: "paragraph",
        content: [
          "Check ",
          { text: "Status", to: "/status" },
          " first to see whether the problem is a partner system or one of our workflows. If a partner system is down, contact its owner using the escalation sheet in the files on this page. For anything else, ",
          { text: "get help", to: "/get-help" },
          ".",
        ],
      },
    ],
  },
];

export const handbookFiles: HandbookFile[] = [
  {
    id: "file-dsa-dhis2",
    name: "DHIS2 data sharing agreement.pdf",
    kind: "pdf",
    size: "1.2 MB",
    bytes: 1.2 * MB,
    addedBy: "Brandon Jackson",
    addedAt: "12 Mar 2025",
  },
  {
    id: "file-crvs-mou",
    name: "OpenCRVS MoU (Registrar General).pdf",
    kind: "pdf",
    size: "860 KB",
    bytes: 0.84 * MB,
    addedBy: "adiallo",
    addedAt: "4 Jun 2025",
  },
  {
    id: "file-escalation",
    name: "Partner escalation contacts.xlsx",
    kind: "sheet",
    size: "48 KB",
    bytes: 0.05 * MB,
    addedBy: "jsmith",
    addedAt: "20 Aug 2026",
  },
  {
    id: "file-naming",
    name: "Naming and environment conventions.md",
    kind: "text",
    size: "6 KB",
    bytes: 0.01 * MB,
    addedBy: "Brandon Jackson",
    addedAt: "2 Sep 2026",
  },
  {
    id: "file-architecture",
    name: "Integration architecture.png",
    kind: "image",
    size: "2.4 MB",
    bytes: 2.4 * MB,
    addedBy: "bwilson",
    addedAt: "18 Sep 2026",
  },
];

export const handbookData: HandbookPageData = {
  pageType: "handbook",
  updatedAt: "2 Oct 2026",
  updatedBy: "Brandon Jackson",
  sections: handbookSections,
  files: handbookFiles,
  capacityBytes: 50 * MB,
};
