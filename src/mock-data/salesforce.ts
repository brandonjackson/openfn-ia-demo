import type { DetailPageData } from "../page-data";

export const salesforceData: DetailPageData = {
  pageType: "detail",
  headerBadge: { label: "Shared", variant: "shared" },
  systemId: "salesforce",
  sections: [
    {
      id: "channels",
      title: "Channels",
      display: "cards",
      items: [
        {
          id: "upsert-contact",
          name: "Upsert a Contact",
          description: "Create or update a Contact record by external ID.",
          metadata: { channelType: "write" },
        },
        {
          id: "contact-updated",
          name: "Contact updated",
          description: "Fires when a Contact record is created or modified.",
          metadata: { channelType: "event" },
        },
        {
          id: "query-contacts",
          name: "Query Contacts",
          description: "Search for Contact records using SOQL queries.",
          metadata: { channelType: "read" },
        },
        {
          id: "upsert-account",
          name: "Upsert an Account",
          description: "Create or update an Account record by external ID.",
          metadata: { channelType: "write" },
        },
        {
          id: "account-updated",
          name: "Account updated",
          description: "Fires when an Account record is created or modified.",
          metadata: { channelType: "event" },
        },
        {
          id: "query-accounts",
          name: "Query Accounts",
          description: "Search for Account records using SOQL queries.",
          metadata: { channelType: "read" },
        },
      ],
    },
  ],
};
