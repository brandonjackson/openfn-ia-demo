import SectionHeader from "../SectionHeader";
import HistoryExportsTable from "./HistoryExportsTable";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { ProjectFile } from "../../types/project-settings";
import type { User } from "../../types/users";

interface Props {
  files: ProjectFile[];
  users: User[];
  sandbox?: boolean;
}

/** The History Exports tab (`#history-exports`, settings.html.heex:1055-1103). */
export default function HistoryExportsPanel({ files, users, sandbox = false }: Props) {
  return (
    <>
      <SectionHeader
        title="History exports"
        subtitle="View export status and download work order history for this project."
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      <HistoryExportsTable files={files} users={users} />
    </>
  );
}
