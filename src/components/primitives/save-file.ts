/**
 * Hands the browser a file to save, made from text in memory: an exported
 * project's YAML, or a fixture standing in for a file a server would send.
 */
export function saveFile(fileName: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
