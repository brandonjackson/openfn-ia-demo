/**
 * Hands the browser a file to save, made from text in memory (an exported
 * project's YAML) or a file a server sent.
 */
export function saveFile(fileName: string, content: string | Blob, type = "text/plain") {
  const url = URL.createObjectURL(typeof content === "string" ? new Blob([content], { type }) : content);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
