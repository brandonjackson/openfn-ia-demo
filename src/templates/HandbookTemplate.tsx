import { useState } from "react";
import { Pencil } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { HandbookFile, HandbookFileKind, HandbookPageData } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import FilesPanel from "../components/FilesPanel";
import WikiArticle from "../components/WikiArticle";
import { currentUser } from "../mock-data/user";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: HandbookPageData;
}

function kindOf(name: string): HandbookFileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext)) return "image";
  return "text";
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * How the organization works: a wiki-style article on the left, and the files
 * that go with it (agreements, contact sheets, diagrams) in a column on the
 * right, like a Claude project's knowledge.
 */
export default function HandbookTemplate({ node, ancestors, data }: Props) {
  const [files, setFiles] = useState<HandbookFile[]>(data.files);

  const addFiles = (added: File[]) => {
    const uploaded = added.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      kind: kindOf(f.name),
      size: formatSize(f.size),
      bytes: f.size,
      addedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      addedAt: "Just now",
    }));
    setFiles((prev) => [...uploaded, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
          current={node.label}
        />
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Last edited {data.updatedAt} by {data.updatedBy}
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={Pencil}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          <WikiArticle sections={data.sections} />
        </div>
        <aside className="lg:sticky lg:top-0 lg:self-start">
          <FilesPanel
            files={files}
            capacityBytes={data.capacityBytes}
            description="Agreements, contacts and reference docs that go with this handbook."
            onAdd={addFiles}
            onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          />
        </aside>
      </div>
    </div>
  );
}
