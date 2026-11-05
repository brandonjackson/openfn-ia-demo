/** "default" is the HTTP channel created automatically when a system gets a URL. */
import { Eye, PenLine, Plug, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChannelType } from "../../model/page-data";
import type { BadgeTone } from "../primitives/Badge";
export type ChannelRowType = ChannelType | "default";

/** Label, icon and badge tone for each kind of channel. */
export const channelTypeConfig: Record<ChannelRowType, { label: string; icon: LucideIcon; tone: BadgeTone }> = {
  write: { label: "Write", icon: PenLine, tone: "green" },
  read: { label: "Read", icon: Eye, tone: "gray" },
  event: { label: "Event", icon: Zap, tone: "pink" },
  default: { label: "Default", icon: Plug, tone: "indigo" },
};
