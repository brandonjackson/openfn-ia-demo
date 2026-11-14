import { useState } from "react";
import { BookOpen, Pencil } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { Handbook, WikiSection } from "../../model/handbook";
import { firstProblemOf } from "../../model/form-error";
import { fromMarkdown, toMarkdown } from "../../model/handbook-markdown";
import FormField from "../../components/primitives/FormField";
import { TextArea } from "../../components/primitives/FormControls";
import Inline from "../../components/primitives/Inline";
import Stack from "../../components/primitives/Stack";
import Text from "../../components/primitives/Text";
import Callout from "../../components/primitives/Callout";
import EmptyState from "../../components/primitives/EmptyState";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Button from "../../components/primitives/Button";
import FilesPanel from "../../components/patterns/FilesPanel";
import Markdown from "../../components/primitives/Markdown";

/** What the Handbook shows: the handbook, as the API gives it. */
export type HandbookPageData = Handbook;

export interface HandbookPageProps extends PageProps<HandbookPageData> {
  /** Saves the article's sections. Rejects with what the server refused. Left out when you can't change the handbook, and there's no Edit. */
  onSaveArticle?: (sections: WikiSection[]) => Promise<void>;
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
export default function HandbookPage({ node, ancestors, data, onSaveArticle, onUploadFiles, onRemoveFile }: HandbookPageProps) {
  // The article as Markdown while it's being edited; null when it's being read.
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [articleError, setArticleError] = useState<unknown>(null);
  const startEditing = () => {
    setArticleError(null);
    setDraft(toMarkdown(data.sections));
  };
  const saveArticle = async () => {
    if (draft === null || !onSaveArticle || saving) return;
    setSaving(true);
    setArticleError(null);
    try {
      await onSaveArticle(fromMarkdown(draft));
      setDraft(null);
    } catch (e) {
      setArticleError(e);
    } finally {
      setSaving(false);
    }
  };

  // A file the server refuses (one that won't fit, or one it doesn't take) is said by the wrapper.
  const attempt = (work: () => Promise<void>) => void work().catch(() => {});

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={data.updatedAt && data.updatedBy ? `Last edited ${data.updatedAt} by ${data.updatedBy}` : undefined}
        actions={
          onSaveArticle &&
          (draft === null ? (
            <Button variant="secondary" size="sm" icon={Pencil} onClick={startEditing}>
              Edit
            </Button>
          ) : (
            <Inline gap="sm">
              <Button variant="secondary" size="sm" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button size="sm" aria-disabled={saving} onClick={saveArticle}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </Inline>
          ))
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          {draft === null ? (
            data.sections.length ? (
              <Markdown source={toMarkdown(data.sections)} contents />
            ) : (
              <EmptyState icon={BookOpen} title="Nothing written yet" description="The organisation's handbook is empty." />
            )
          ) : (
            <Stack gap="md">
              {articleError !== null && (
                <Callout variant="danger" title="That didn't save">
                  {firstProblemOf(articleError)}
                </Callout>
              )}
              <FormField
                label="Article"
                htmlFor="handbook-article"
                hint={
                  <Text tone="muted">
                    Markdown: <Text mono>## Heading</Text> starts a section, <Text mono>- item</Text> makes a list,{" "}
                    <Text mono>| Label | Detail |</Text> rows make facts, and <Text mono>[text](/path)</Text> links to a page.
                  </Text>
                }
              >
                <TextArea id="handbook-article" mono autoFocus rows={28} value={draft} onChange={(e) => setDraft(e.target.value)} />
              </FormField>
            </Stack>
          )}
        </div>
        <aside className="lg:sticky lg:top-0 lg:self-start">
          <FilesPanel
            files={data.files}
            capacityBytes={data.capacityBytes}
            description="Agreements, contacts and reference docs that go with this handbook."
            onAdd={onUploadFiles && ((files) => attempt(() => onUploadFiles(files)))}
            onRemove={onRemoveFile && ((id) => attempt(() => onRemoveFile(id)))}
          />
        </aside>
      </div>
    </div>
  );
}
