import { useState } from "react";
import { Pencil } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { HandbookPageData } from "../model/page-data";
import { firstProblemOf } from "../model/form-error";
import Callout from "../components/primitives/Callout";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import Button from "../components/primitives/Button";
import FilesPanel from "../components/patterns/FilesPanel";
import WikiArticle from "../components/patterns/WikiArticle";

export interface HandbookPageProps extends PageProps<HandbookPageData> {
  /** Uploads files to go with the handbook. Rejects with what the server refused. Left out when you can't change the handbook. */
  onUploadFiles?: (files: File[]) => Promise<void>;
  /** Removes one of the handbook's files. Left out when you can't change the handbook. */
  onRemoveFile?: (id: string) => Promise<void>;
}

/**
 * How the organization works: a wiki-style article on the left, and the files
 * that go with it (agreements, contact sheets, diagrams) in a column on the
 * right, like a Claude project's knowledge.
 */
export default function HandbookPage({ node, ancestors, data, onUploadFiles, onRemoveFile }: HandbookPageProps) {
  // A change the server refused: a file that won't fit, or one it doesn't take.
  const [error, setError] = useState<unknown>(null);
  const attempt = (work: () => Promise<void>) => {
    setError(null);
    work().catch(setError);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
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
            onAdd={onUploadFiles && ((files) => attempt(() => onUploadFiles(files)))}
            onRemove={onRemoveFile && ((id) => attempt(() => onRemoveFile(id)))}
            notice={
              error !== null && (
                <Callout variant="danger" title="That didn't save">
                  {firstProblemOf(error)}
                </Callout>
              )
            }
          />
        </aside>
      </div>
    </div>
  );
}
