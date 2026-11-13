import { useState } from "react";
import FileDropzone from "../primitives/FileDropzone";
import { TextArea } from "../primitives/FormControls";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The text box's id, for its `FormField`'s `htmlFor` and for focusing it on a problem. */
  id: string;
  /** The JSON as it stands. */
  value: string;
  /** Called with the new JSON, typed or read from a file (pretty-printed when it parses). */
  onChange: (value: string) => void;
  /** What the box shows while empty, e.g. a small example. */
  placeholder?: string;
  /** How tall the box is. */
  rows?: number;
  /** What the drop area says, e.g. "Drop a .json file here or click to upload". */
  uploadLabel?: string;
}

/**
 * A piece of JSON attached to something, such as a test case's input or
 * the output it expects: typed or pasted into the box, or read from a
 * `.json` file dropped or picked below it, which fills the box so it can be
 * checked and changed before it's saved. Put it in a `FormField`, which
 * says what's wrong with it.
 */
export default function JsonAttachment({ id, value, onChange, placeholder, rows = 6, uploadLabel = "Drop a .json file here or click to upload" }: Props) {
  const [from, setFrom] = useState<string>();
  const [unreadable, setUnreadable] = useState<string>();

  async function read(file: File) {
    try {
      const text = await file.text();
      let shown = text;
      try {
        shown = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // Not JSON: show it as it is, so the field can say what's wrong.
      }
      setUnreadable(undefined);
      setFrom(file.name);
      onChange(shown);
    } catch {
      setUnreadable(`${file.name} couldn't be read.`);
    }
  }

  return (
    <Stack gap="sm">
      <TextArea
        id={id}
        rows={rows}
        mono
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setFrom(undefined);
          onChange(e.target.value);
        }}
      />
      <FileDropzone compact multiple={false} accept=".json,application/json" title={uploadLabel} onFiles={([file]) => file && void read(file)} />
      {from && (
        <Text size="xs" tone="muted" role="status">
          Read from {from}. Change it here before you save, if you need to.
        </Text>
      )}
      {unreadable && (
        <Text size="xs" tone="danger" role="alert">
          {unreadable}
        </Text>
      )}
    </Stack>
  );
}
