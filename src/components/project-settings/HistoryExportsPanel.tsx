import SectionHeader from "../SectionHeader";
import HistoryExportsTable from "./HistoryExportsTable";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { ProjectFile } from "../../mock-data/project-settings";

interface Props {
  files: ProjectFile[];
  sandbox?: boolean;
}

/** The History Exports tab (`#history-exports`, settings.html.heex:1055-1103). */
export default function HistoryExportsPanel({ files, sandbox = false }: Props) {
  return (
    <>
      <SectionHeader
        title="History exports"
        subtitle="View export status and download work order history for this project."
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      <HistoryExportsTable files={files} />
    </>
  );
}
