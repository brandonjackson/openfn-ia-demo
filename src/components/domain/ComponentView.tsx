import { useState } from "react";
import { Save } from "lucide-react";
import { contentError, contentFormats, type ComponentContent, type ContentComponentType } from "../../model/project-components";
import { componentTypeIcons } from "../../model/component-types";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Card from "../primitives/Card";
import CodeEditor from "../primitives/CodeEditor";
import Inline from "../primitives/Inline";
import ScrollPane from "../primitives/ScrollPane";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** Shown as the heading in a pane; a page has its own header. */
  name: string;
  description: string;
  type: ContentComponentType;
  /** What it holds now, on the server. */
  content: ComponentContent;
  variant?: "pane" | "page";
  /** Saves new content; resolves once it's saved, or rejects with why not. Left out where you can't change it. */
  onSave?: (content: string) => Promise<void>;
}

/**
 * A form, artifact, AI skill, document or static website: the one file it
 * is, in an editor, with Save. A form or artifact is JSON and can't be saved
 * until it parses. The same view in two places, as `ChannelView` is: the
 * project's page for the component ("page", under the page's own header),
 * and in the workflow editor, opened from the code view's explorer in the
 * code's place ("pane", with its own heading and scroll).
 */
export default function ComponentView({ name, description, type, content, variant = "pane", onSave }: Props) {
  const format = contentFormats[type];
  const [draft, setDraft] = useState(content.content);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<string>();
  const dirty = draft !== content.content;
  const invalid = dirty ? contentError(type, draft) : undefined;

  const save = async () => {
    if (!onSave || !dirty || invalid) return;
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSave(draft);
    } catch (error) {
      setRefusal(fieldErrorOf(error, "content") ?? errorMessageOf(error));
    } finally {
      setSaving(false);
    }
  };

  const when = content.updatedAt.charAt(0).toLowerCase() + content.updatedAt.slice(1);
  const changed = `Changed ${when}${content.updatedBy ? ` by ${content.updatedBy}` : ""}.`;
  const body = (
    <Stack gap="lg">
      {variant === "pane" && (
        <SectionHeading title={name} description={description || undefined} action={<Badge label={type} icon={componentTypeIcons[type]} shape="tag" />} />
      )}
      <Card
        title={format.file}
        description={format.about}
        actions={
          onSave && (
            <Inline gap="sm">
              <Text tone={invalid ? "danger" : "muted"} size="xs" nowrap>
                {saving ? "Saving…" : invalid ? invalid : dirty ? "Unsaved changes" : "Saved"}
              </Text>
              <Button size="sm" icon={Save} disabled={!dirty || !!invalid || saving} onClick={() => void save()}>
                Save
              </Button>
            </Inline>
          )
        }
      >
        <Stack gap="sm">
          {refusal && <Callout variant="danger" title="Not saved">{refusal}</Callout>}
          <CodeEditor code={draft} onChange={onSave ? setDraft : undefined} frame="box" label={format.file} />
          <Text tone="subtle" size="xs">
            {onSave ? changed : `${changed} Read only.`}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
  return variant === "pane" ? <ScrollPane>{body}</ScrollPane> : body;
}
