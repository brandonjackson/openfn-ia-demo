import { useState } from "react";
import { adaptorAtVersion, latestAdaptor } from "../../mock-data/adaptors";
import type { EditorJob } from "../../mock-data/workflow";
import AdaptorSelectionModal from "./AdaptorSelectionModal";
import ConfigureAdaptorModal from "./ConfigureAdaptorModal";

export type AdaptorModal = "configure" | "picker" | null;

interface Props {
  /** Which modal is showing. */
  open: AdaptorModal;
  onOpenChange: (open: AdaptorModal) => void;
  projectId: string;
  job: Pick<EditorJob, "adaptor" | "credentialName">;
  /** Short names of adaptors already used in the workflow, listed first in the picker. */
  adaptorsInUse: string[];
  onChange: (patch: Partial<Pick<EditorJob, "adaptor" | "credentialName">>) => void;
  /**
   * Reopen "Configure connection" when the picker was opened from it and
   * closes (the inspector does; the IDE doesn't).
   */
  returnToConfigure?: boolean;
}

/**
 * A job's adaptor dialogs: "Configure connection" (version and credential)
 * and the adaptor picker it hands off to. Changing the version keeps the
 * package; picking a new adaptor sets it to `latest` and clears the
 * credential.
 */
export default function AdaptorConfigModals({ open, onOpenChange, projectId, job, adaptorsInUse, onChange, returnToConfigure = false }: Props) {
  const [pickerFromConfigure, setPickerFromConfigure] = useState(false);

  return (
    <>
      <ConfigureAdaptorModal
        isOpen={open === "configure"}
        onClose={() => onOpenChange(null)}
        projectId={projectId}
        adaptor={job.adaptor}
        credentialName={job.credentialName}
        onChangeAdaptor={() => {
          setPickerFromConfigure(true);
          onOpenChange("picker");
        }}
        onVersionChange={(v) => onChange({ adaptor: adaptorAtVersion(job.adaptor, v) })}
        onCredentialChange={(name) => onChange({ credentialName: name })}
      />
      <AdaptorSelectionModal
        isOpen={open === "picker"}
        adaptorsInUse={adaptorsInUse}
        onClose={() => {
          onOpenChange(returnToConfigure && pickerFromConfigure ? "configure" : null);
          setPickerFromConfigure(false);
        }}
        onSelect={(pkg) => onChange({ adaptor: latestAdaptor(pkg), credentialName: null })}
      />
    </>
  );
}
