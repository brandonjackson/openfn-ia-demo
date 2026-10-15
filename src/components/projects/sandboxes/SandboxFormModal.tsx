import { useState } from "react";
import { sandboxColorPalette } from "../../../mock-data/sandboxes";
import FormModal from "../../FormModal";
import NameField from "../../NameField";
import { useToast } from "../../Toast";
import { urlSafeName } from "../../../utils/format";
import ColorPalette from "./ColorPalette";

/**
 * Create / edit a sandbox (SandboxLive.FormComponent): Name, the URL-safe
 * name it will get, and a colour. New sandboxes say which project they'll
 * sit under and start with a random colour. Saving just closes.
 */
export default function SandboxFormModal({
  mode,
  parentName,
  parentIsSandbox = false,
  initialName = "",
  initialColor,
  existingNames = [],
  onClose,
}: {
  mode: "new" | "edit";
  parentName: string;
  parentIsSandbox?: boolean;
  initialName?: string;
  initialColor?: string | null;
  /** Sibling names, for "Sandbox name already exists". */
  existingNames?: string[];
  onClose: () => void;
}) {
  const [rawName, setRawName] = useState(initialName);
  const [color, setColor] = useState<string | null>(
    () => initialColor ?? sandboxColorPalette[Math.floor(Math.random() * sandboxColorPalette.length)]
  );
  const name = urlSafeName(rawName);
  const errors = existingNames.includes(name) && name !== initialName ? ["Sandbox name already exists"] : [];
  const valid = name !== "" && errors.length === 0;
  const toast = useToast();

  return (
    <FormModal
      open
      onClose={onClose}
      size="md"
      title={mode === "new" ? "Create a new sandbox" : "Edit sandbox"}
      description={
        mode === "new" && (
          <>
            This sandbox will be created under the <span className="font-medium">{parentName}</span>{" "}
            {parentIsSandbox ? "sandbox" : "project"}.
          </>
        )
      }
      formId="sandbox-form"
      onSubmit={() => {
        if (!valid) return;
        onClose();
        toast(mode === "new" ? "Sandbox created" : "Sandbox updated");
      }}
      submitLabel={mode === "new" ? "Create sandbox" : "Save changes"}
      submitDisabled={mode === "new" && !valid}
    >
      {/* Lightning hides the hint while the name has errors (its changeset
          already carries "can't be blank" when it's blank). */}
      <NameField
        id="sandbox_raw_name"
        required
        placeholder="My Sandbox"
        value={rawName}
        onChange={(raw) => setRawName(raw)}
        errors={errors}
        hideBadgeOnError
        badgeLabel={mode === "new" ? "Your sandbox will be named" : "The sandbox will be named"}
      />
      <ColorPalette value={color} onChange={setColor} />
    </FormModal>
  );
}
