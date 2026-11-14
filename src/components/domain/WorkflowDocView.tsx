import { FileText, FlaskConical } from "lucide-react";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Inline from "../primitives/Inline";
import MarkdownEditor from "../primitives/MarkdownEditor";
import ScrollPane from "../primitives/ScrollPane";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import ReadOnlyNotice from "./ReadOnlyNotice";

interface Props {
  /** The file's name, e.g. "spec.md". */
  name: string;
  /** What the file is for, under its name. */
  description?: string;
  /** The Markdown it holds. */
  content: string;
  /** Saves new Markdown; resolves once it's saved, or rejects with an `Error` saying why not. Left out where it can't be changed (main). */
  onSave?: (content: string) => Promise<void>;
  /** On main, where it can't be changed: offers "Edit in sandbox" in Edit's place. */
  onEditInSandbox?: () => void;
}

/**
 * One of the workflow's own Markdown files (context.md, spec.md, or a doc
 * added beside them), shown in the code view's main area the way the
 * Handbook shows its article: drawn as it reads, with Edit to change it in
 * the code editor, then Save or Cancel. On main it reads only, with "Edit in
 * sandbox" where Edit would be.
 */
export default function WorkflowDocView({ name, description, content, onSave, onEditInSandbox }: Props) {
  return (
    <ScrollPane>
      <MarkdownEditor
        source={content}
        onSave={onSave}
        label={name}
        readOnlyAction={
          onEditInSandbox && (
            <Inline gap="sm">
              <ReadOnlyNotice variant="tag" />
              <Button variant="secondary" size="sm" icon={FlaskConical} onClick={onEditInSandbox}>
                Edit in sandbox
              </Button>
            </Inline>
          )
        }
        empty={<Text tone="muted">Nothing written yet.{onSave ? " Press Edit to start it." : ""}</Text>}
      >
        {({ actions, body, editing }) => (
          <Card title={name} description={description} actions={actions}>
            <Stack gap="sm">
              {body}
              {editing && (
                <Inline gap="xs">
                  <Badge label="Markdown" icon={FileText} shape="tag" />
                  <Text tone="subtle" size="xs">
                    Headings with #, lists with - or 1., tables with |, code between ``` lines.
                  </Text>
                </Inline>
              )}
            </Stack>
          </Card>
        )}
      </MarkdownEditor>
    </ScrollPane>
  );
}
