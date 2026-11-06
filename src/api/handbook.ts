/**
 * The organisation's handbook files, on the demo's own routes
 * (`/api/demo/handbook`; Lightning's API has no handbook).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HandbookFile, HandbookFileKind, WikiSection } from "../model/page-data";
import { timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

interface ApiFile {
  id: string;
  attributes: { name: string; kind: HandbookFileKind; bytes: number; added_by: string; inserted_at: string };
}

const keys = { handbook: ["handbook"] as const, files: ["handbook", "files"] as const };

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

/** The handbook: its article, who last edited it, how much it holds, and whether you can change it (anyone in the organisation can). */
export interface Handbook {
  sections: WikiSection[];
  updatedBy: string;
  updatedAt: string;
  capacityBytes: number;
  canEdit: boolean;
}

interface ApiHandbook {
  capacity_bytes: number;
  can_edit: boolean;
  sections: WikiSection[];
  updated_by: string;
  updated_at: string;
}

export function useHandbook(): { status: LoadStatus; handbook: Handbook | undefined } {
  const query = useQuery({
    queryKey: keys.handbook,
    queryFn: () => request<{ data: { attributes: ApiHandbook } }>("GET", "/api/demo/handbook"),
    select: ({ data: { attributes: a } }): Handbook => ({
      sections: a.sections,
      updatedBy: a.updated_by,
      updatedAt: timeAgo(a.updated_at),
      capacityBytes: a.capacity_bytes,
      canEdit: a.can_edit,
    }),
  });
  return { status: statusOf(query), handbook: query.data };
}

/** The handbook's files, newest first. */
export function useHandbookFiles(): { status: LoadStatus; files: HandbookFile[] } {
  const query = useQuery({
    queryKey: keys.files,
    queryFn: () => listAll<ApiFile>("/api/demo/handbook/files"),
    select: (rows) =>
      rows.map(({ id, attributes: a }): HandbookFile => ({
        id,
        name: a.name,
        kind: a.kind,
        size: formatSize(a.bytes),
        bytes: a.bytes,
        addedBy: a.added_by,
        addedAt: timeAgo(a.inserted_at),
      })),
  });
  return { status: statusOf(query), files: query.data ?? [] };
}

/**
 * Saving the article, and adding and removing files. Uploading sends each file in turn and stops at
 * the first the server refuses; the ones before it are kept. Each resolves
 * once the list has reloaded.
 */
export function useHandbookSaves() {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: (work: () => Promise<unknown>) => work(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.handbook }),
  });
  return {
    upload: (files: { name: string; size: number }[]) =>
      run
        .mutateAsync(async () => {
          for (const f of files) await request("POST", "/api/demo/handbook/files", { name: f.name, bytes: f.size });
        })
        .then(() => undefined),
    /** Replaces the article's sections. Rejects with what the server refused. */
    saveArticle: (sections: WikiSection[]) => run.mutateAsync(() => request("PUT", "/api/demo/handbook/article", { sections })).then(() => undefined),
    remove: (id: string) => run.mutateAsync(() => request("DELETE", `/api/demo/handbook/files/${id}`)).then(() => undefined),
  };
}
