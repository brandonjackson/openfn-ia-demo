import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { HandbookFile, HandbookFileKind } from "../model/page-data";
import { handbookData } from "../fixtures/handbook";
import { currentUser } from "../fixtures/user";
import HandbookPage from "./HandbookPage";
import { pageFrame } from "./route.fixtures";

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

/** Feeds the Handbook from fixtures, with files uploaded or removed this session. */
export default function HandbookPageFixtures({ route }: { route: PageRoute }) {
  // The handbook's files as they stand this session: the fixtures' stand-in for the server.
  const [files, setFiles] = useState<HandbookFile[]>(handbookData.files);

  return (
    <HandbookPage
      {...pageFrame(route)}
      data={{ ...handbookData, files }}
      onUploadFiles={async (added) => {
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
      }}
      onRemoveFile={async (id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
    />
  );
}
