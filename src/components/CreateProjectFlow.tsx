import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface NewProjectInput {
  name: string;
  environment: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the form values when the user creates the project. */
  onCreate: (project: NewProjectInput) => void;
}

/* ------------------------------------------------------------------ */
/*  Create project modal                                               */
/* ------------------------------------------------------------------ */

export default function CreateProjectFlow({ open, onClose, onCreate }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <CreateProjectModal onClose={onClose} onCreate={onCreate} />;
}

function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (project: NewProjectInput) => void;
}) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("main");
  const [description, setDescription] = useState("");

  const canCreate = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    onCreate({
      name: name.trim(),
      environment: environment.trim(),
      description: description.trim(),
    });
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Create Project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 overflow-y-auto flex-1">
          {/* Intro */}
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FolderPlus size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">New project</p>
              <p className="text-xs text-blue-600">
                Projects are isolated workspaces that contain workflows.
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Planning Application Intake"
                autoFocus
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                A unique name to identify this project.
              </p>
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project environment
              </label>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Credentials will be loaded with values from this environment.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this project is used for..."
                rows={3}
                maxLength={240}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                {description.length}/240 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canCreate}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create project
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
