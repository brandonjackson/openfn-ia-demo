import type { ComponentProps } from "react";
import { Download } from "lucide-react";
import Button from "./Button";
import { saveFile } from "./save-file";

interface Props extends Omit<ComponentProps<typeof Button>, "onClick" | "icon"> {
  /** The name the browser saves it as, e.g. "project-a.yaml". */
  fileName: string;
  /** The file's text. */
  content: string;
  /** Its media type, e.g. "application/yaml". */
  mimeType?: string;
}

/** A button that saves text the page already has as a file. */
export default function DownloadButton({ fileName, content, mimeType, children, ...rest }: Props) {
  return (
    <Button icon={Download} onClick={() => saveFile(fileName, content, mimeType)} {...rest}>
      {children}
    </Button>
  );
}
