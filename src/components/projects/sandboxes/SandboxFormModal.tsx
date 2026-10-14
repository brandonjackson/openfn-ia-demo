import { useState } from "react";
import { sandboxColorPalette } from "../../../mock-data/sandboxes";
import Button from "../../Button";
import { TextInput } from "../../Inputs";
import Modal from "../../Modal";
import NameBadge from "../../NameBadge";
import { slugify } from "../format";
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
  const name = slugify(rawName);
  const errors = existingNames.includes(name) && name !== initialName ? ["Sandbox name already exists"] : [];
  const valid = name !== "" && errors.length === 0;

  return (
    <Modal
      open
      onClose={onClose}
      width="w-full max-w-lg"
      title={<span className="font-bold">{mode === "new" ? "Create a new sandbox" : "Edit sandbox"}</span>}
      subtitle={
        mode === "new" && (
          <span className="text-sm text-slate-800">
            This sandbox will be created under the <span className="font-medium">{parentName}</span>{" "}
            {parentIsSandbox ? "sandbox" : "project"}.
          </span>
        )
      }
      footer={
        <>
          <Button type="submit" form="sandbox-form" theme="primary" disabled={mode === "new" && !valid}>
            {mode === "new" ? "Create sandbox" : "Save changes"}
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <form
        id="sandbox-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onClose();
        }}
      >
        <div className="space-y-6 bg-white">
          <div className="space-y-2">
            <TextInput
              id="sandbox_raw_name"
              label="Name"
              required
              placeholder="My Sandbox"
              value={rawName}
              onChange={(e) => setRawName(e.target.value)}
              errors={errors}
            />
            {/* Lightning hides the hint while the name is blank (its changeset
                already carries "can't be blank"). */}
            {errors.length === 0 && name !== "" && (
              <small className="block text-xs text-gray-600">
                <NameBadge name={name}>
                  {mode === "new" ? "Your sandbox will be named" : "The sandbox will be named"}
                </NameBadge>
              </small>
            )}
          </div>
          <ColorPalette value={color} onChange={setColor} />
        </div>
      </form>
    </Modal>
  );
}
