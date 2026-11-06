/**
 * The organisation's handbook files on the pretend server. Lightning's API
 * has no handbook (it's the demo's), so these routes live under
 * `/api/demo/` and follow api/conventions.md.
 *
 * Lifecycle: anyone in the organisation adds a file or removes one. A file's
 * name is unique in the handbook, its type is one the handbook takes, and
 * together the files fit the handbook's capacity. The demo keeps each file's
 * name and size, not its contents. The article itself isn't editable yet.
 */
import { handbookData } from "../fixtures/handbook";
import { seedId } from "../fixtures/ids";
import type { HandbookFileKind } from "../model/page-data";
import { badId, forbidden, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { inOrganization } from "./organization";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";

export interface HandbookFileRow {
  id: string;
  name: string;
  kind: HandbookFileKind;
  bytes: number;
  added_by: string;
  inserted_at: string;
}

const KINDS: Record<string, HandbookFileKind> = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  xls: "sheet",
  xlsx: "sheet",
  csv: "sheet",
  txt: "text",
  md: "text",
  png: "image",
  jpg: "image",
  jpeg: "image",
};

export const CAPACITY_BYTES = handbookData.capacityBytes;

export const handbookFiles = table<HandbookFileRow>("handbook_files", () =>
  handbookData.files.map((f) => ({
    id: seedId("handbook_file", f.id),
    name: f.name,
    kind: f.kind,
    bytes: Math.round(f.bytes),
    added_by: f.addedBy,
    inserted_at: seedTime(f.addedAt),
  })),
);

const entry = (f: HandbookFileRow) => ({
  type: "handbook_files",
  id: f.id,
  attributes: { ...f, id: undefined },
  links: { self: `${ORIGIN}/api/demo/handbook/files/${f.id}` },
});

const usedBytes = () => handbookFiles.rows().reduce((sum, f) => sum + f.bytes, 0);
const MB = 1024 * 1024;

export const handbookRoutes: Record<string, Handler> = {
  "GET /api/demo/handbook": () =>
    json(200, { data: { type: "handbooks", attributes: { capacity_bytes: CAPACITY_BYTES, used_bytes: usedBytes(), can_edit: inOrganization() } } }),
  "GET /api/demo/handbook/files": (_params, _body, query) => {
    const rows = handbookFiles.rows().sort((a, b) => b.inserted_at.localeCompare(a.inserted_at));
    return json(200, paged("/api/demo/handbook/files", rows.map(entry), query));
  },
  // Adds a file: its name and size (the demo doesn't keep contents).
  "POST /api/demo/handbook/files": (_params, body) => {
    if (!inOrganization()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["name", "bytes"]);
    const name = typeof body["name"] === "string" ? body["name"].trim() : "";
    const bytes = body["bytes"];
    const kind = KINDS[name.split(".").pop()?.toLowerCase() ?? ""];
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (!kind) errors.push({ code: "format", detail: "isn't a type the handbook takes (PDF, Word, Excel, CSV, text, Markdown or an image)", pointer: "#/name" });
    else if (handbookFiles.rows().some((f) => f.name.toLowerCase() === name.toLowerCase())) errors.push({ code: "taken", detail: "is already in the handbook", pointer: "#/name" });
    if (typeof bytes !== "number" || !Number.isInteger(bytes) || bytes < 0) errors.push({ code: "type", detail: "must be a whole number of bytes", pointer: "#/bytes" });
    else if (usedBytes() + bytes > CAPACITY_BYTES)
      errors.push({ code: "too_large", detail: `would take the handbook over its ${Math.round(CAPACITY_BYTES / MB)} MB`, pointer: "#/bytes" });
    if (errors.length) return invalid(errors);
    const me = findUser(currentUserId());
    const row: HandbookFileRow = { id: crypto.randomUUID(), name, kind: kind!, bytes: bytes as number, added_by: me ? fullName(me) : "Someone", inserted_at: now() };
    handbookFiles.insert(row);
    record("file_added", { type: "handbook", id: row.id, name }, { after: { name } }, true);
    return json(201, { data: entry(row) });
  },
  "DELETE /api/demo/handbook/files/:id": ({ id }) => {
    if (!inOrganization()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const f = handbookFiles.rows().find((r) => r.id === id);
    if (!f) return notFound();
    handbookFiles.remove((r) => r.id === id);
    record("file_removed", { type: "handbook", id: f.id, name: f.name }, { before: { name: f.name } }, true);
    return noContent();
  },
};
