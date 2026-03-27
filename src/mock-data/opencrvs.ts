import type { DetailPageData } from "../page-data";

export const opencrvsData: DetailPageData = {
  pageType: "detail",
  headerBadge: { label: "Shared", variant: "shared" },
  sections: [
    {
      id: "channels",
      title: "Channels",
      display: "cards",
      items: [
        {
          id: "notify-birth",
          name: "Notify a birth",
          description: "Submit a birth notification from a health facility.",
          metadata: { channelType: "write" },
        },
        {
          id: "birth-registered",
          name: "Birth registered",
          description: "Fires when a birth is officially registered.",
          metadata: { channelType: "event" },
        },
        {
          id: "search-birth",
          name: "Search for a birth record",
          description: "Look up births by name, date, location, or ID.",
          metadata: { channelType: "read" },
        },
        {
          id: "notify-death",
          name: "Notify a death",
          description: "Submit a death notification from a health facility.",
          metadata: { channelType: "write" },
        },
        {
          id: "death-registered",
          name: "Death registered",
          description: "Fires when a death is officially registered.",
          metadata: { channelType: "event" },
        },
        {
          id: "search-death",
          name: "Search for a death record",
          description: "Look up deaths by name, date, location, or ID.",
          metadata: { channelType: "read" },
        },
      ],
    },
  ],
};
