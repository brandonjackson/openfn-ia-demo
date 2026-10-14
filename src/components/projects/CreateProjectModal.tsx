import { useState } from "react";
import Button from "../Button";
import { TextArea, TextInput } from "../Inputs";
import Modal from "../Modal";
import NameBadge from "../NameBadge";
import { slugify } from "./format";

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
  const name = slugify(rawName);
  const tooLong = description.length > 240;
  const valid = name !== "" && !tooLong;

  const close = () => {
    setRawName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={<span className="font-bold">Create a new project</span>}
      width="w-auto xl:min-w-1/3 min-w-1/2 max-w-full"
      footer={
        <>
          <Button
            type="submit"
            form="project-form"
            theme="primary"
            disabled={!valid}
          >
            Create project
          </Button>
          <Button id="cancel-project-creation" theme="secondary" onClick={close}>
            Cancel
          </Button>
        </>
      }
    >
      <form
        id="project-form"
        className="text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onCreate?.({ name, description });
          close();
        }}
      >
        <div className="container mx-auto px-6 space-y-6 bg-white">
          <div className="space-y-4">
            <TextInput
              id="project_raw_name"
              label="Name"
              required
              value={rawName}
              onChange={(e) => setRawName(e.target.value)}
              errors={rawName !== "" && name === "" ? ["can't be blank"] : []}
            />
            <small className="mt-2 block text-xs text-gray-600">
              <NameBadge name={name}>Your project will be named</NameBadge>
            </small>
          </div>
          <div className="space-y-4">
            <TextArea
              id="project_description"
              label="Description"
              className="bg-white text-slate-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              errors={tooLong ? ["should be at most 240 character(s)"] : []}
            />
            <small className="mt-2 block text-xs text-gray-600">
              A short description of a project [max 240 characters]
            </small>
          </div>
        </div>
      </form>
    </Modal>
  );
}
