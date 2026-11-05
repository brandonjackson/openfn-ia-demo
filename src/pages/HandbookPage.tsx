import { Pencil } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { HandbookPageData } from "../model/page-data";
import PageHeader from "../components/patterns/PageHeader";
import Button from "../components/primitives/Button";
import FilesPanel from "../components/patterns/FilesPanel";
import WikiArticle from "../components/patterns/WikiArticle";

export interface HandbookPageProps extends PageProps<HandbookPageData> {
  /** Uploads files to go with the handbook. */
  onUploadFiles: (files: File[]) => Promise<void>;
  /** Removes one of the handbook's files. */
  onRemoveFile: (id: string) => Promise<void>;
}

/**
 * How the organization works: a wiki-style article on the left, and the files
 * that go with it (agreements, contact sheets, diagrams) in a column on the
 * right, like a Claude project's knowledge.
 */
export default function HandbookPage({ node, ancestors, data, onUploadFiles, onRemoveFile }: HandbookPageProps) {

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
        ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
        current: node.label,
      }}
        title={node.label}
        description={`Last edited ${data.updatedAt} by ${data.updatedBy}`}
        actions={
          <Button variant="secondary" size="sm" icon={Pencil}>
            Edit
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          <WikiArticle sections={data.sections} />
        </div>
        <aside className="lg:sticky lg:top-0 lg:self-start">
          <FilesPanel
            files={data.files}
            capacityBytes={data.capacityBytes}
            description="Agreements, contacts and reference docs that go with this handbook."
            onAdd={(files) => void onUploadFiles(files)}
            onRemove={(id) => void onRemoveFile(id)}
          />
        </aside>
      </div>
    </div>
  );
}
