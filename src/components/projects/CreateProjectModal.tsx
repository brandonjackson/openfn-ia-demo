import { useState } from "react";
import FormModal from "../FormModal";
import { TextArea } from "../Inputs";
import NameField from "../NameField";
import { urlSafeName } from "../../utils/format";

/**
 * "Create a new project" (DashboardLive.ProjectCreationModal): Name, with
 * the URL-safe name it will get, and an optional Description. Create is
 * disabled until the name is valid. No backend: submitting just closes.
 */
export default function CreateProjectModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate?: (project: { name: string; description: string }) => void;
}) {
  const [rawName, setRawName] = useState("");
  const [description, setDescription] = useState("");
  const name = urlSafeName(rawName);
  const tooLong = description.length > 240;
  const valid = name !== "" && !tooLong;

  const close = () => {
    setRawName("");
    setDescription("");
    onClose();
  };

  return (
    <FormModal
      open={open}
      onClose={close}
      title="Create a new project"
      size="md"
      formId="project-form"
      onSubmit={() => {
        onCreate?.({ name, description });
        close();
      }}
      submitLabel="Create project"
      submitDisabled={!valid}
      cancelId="cancel-project-creation"
    >
      <NameField
        id="project_raw_name"
        required
        value={rawName}
        onChange={(raw) => setRawName(raw)}
        errors={rawName !== "" && name === "" ? ["can't be blank"] : []}
        badgeLabel="Your project will be named"
      />
      <div className="space-y-2">
        <TextArea
          id="project_description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          errors={tooLong ? ["should be at most 240 character(s)"] : []}
        />
        <p className="text-xs text-gray-600">
          A short description of a project [max 240 characters]
        </p>
      </div>
    </FormModal>
  );
}
